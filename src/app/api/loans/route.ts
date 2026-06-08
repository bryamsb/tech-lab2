import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

interface Borrower {
  id: string;
  full_name?: string | null;
  username?: string | null;
  [key: string]: unknown;
}

interface ItemRow {
  id: string;
  name?: string | null;
  [key: string]: unknown;
}

type LoanRow = {
  id: string;
  item_id: string;
  borrower_id?: string;
  user_name?: string;
  loan_date: string;
  expected_return_date: string;
  status?: string;
  [key: string]: unknown;
};

type GlobalWithLoans = typeof globalThis & {
  __techLabLoans?: LoanRow[];
};

const runtime = globalThis as GlobalWithLoans;

const readMockJson = async <T,>(fileName: string): Promise<T> => {
  const filePath = path.join(process.cwd(), 'public', 'mocks', fileName);
  const content = await readFile(filePath, 'utf-8');
  return JSON.parse(content) as T;
};

const getLoanStore = async (): Promise<LoanRow[]> => {
  if (!runtime.__techLabLoans) {
    const initial = await readMockJson<{ prestamos?: LoanRow[] }>('investigadores.json');
    runtime.__techLabLoans = initial.prestamos || [];
  }
  return runtime.__techLabLoans;
};

// GET: list loans
export async function GET() {
  try {
    const loans = await getLoanStore();

    // Enrich loans with borrower name and item name
    const borrowerIds = Array.from(
      new Set((loans || []).map((l) => l.borrower_id).filter(Boolean) as string[])
    );
    const itemIds = Array.from(new Set((loans || []).map((l) => l.item_id).filter(Boolean) as string[]));

    const [usersJson, items] = await Promise.all([
      readMockJson<{ usuarios?: Borrower[] }>('usuarios.json'),
      readMockJson<ItemRow[]>('equipos.json'),
    ]);

    const borrowers = (usersJson.usuarios || []).filter((user) => borrowerIds.includes(String(user.id)));
    const filteredItems = (items || []).filter((item) => itemIds.includes(String(item.id)));

    const borrowerMap: Record<string, Borrower | undefined> = {};
    borrowers.forEach((b) => (borrowerMap[String(b.id)] = b));

    const itemMap: Record<string, ItemRow | undefined> = {};
    filteredItems.forEach((it) => (itemMap[String(it.id)] = it));

    const enriched = (loans || []).map((l) => ({
      ...l,
      borrower_name: l.user_name || (borrowerMap[String(l.borrower_id)]?.full_name || borrowerMap[String(l.borrower_id)]?.username) || null,
      item_name: itemMap[String(l.item_id)]?.name || null,
    }));

    return NextResponse.json({ loans: enriched });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

// POST: create loan with conflict check
export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Adapted to existing schema: item_id, borrower_id, loan_date, expected_return_date
    const { item_id, borrower_id, loan_date, expected_return_date } = body;

    if (!item_id || !loan_date || !expected_return_date) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Check for conflicts for the same item where ranges overlap
    const loans = await getLoanStore();

    const conflicts = loans.filter((loan) => {
      if (loan.item_id !== item_id) return false;
      const loanStart = new Date(loan.loan_date).getTime();
      const loanEnd = new Date(String(loan.expected_return_date)).getTime();
      const newStart = new Date(String(loan_date)).getTime();
      const newEnd = new Date(String(expected_return_date)).getTime();
      return loanStart <= newEnd && loanEnd >= newStart;
    });

    if (conflicts && conflicts.length > 0) {
      return NextResponse.json({ error: 'Conflict', conflicts }, { status: 409 });
    }

    const now = new Date().toISOString();
    const data: LoanRow = {
      id: crypto.randomUUID(),
      item_id,
      borrower_id,
      loan_date,
      expected_return_date,
      status: 'active',
      created_at: now,
      updated_at: now,
    };

    loans.push(data);

    return NextResponse.json({ loan: data }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
