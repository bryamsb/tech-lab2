import type { ReactNode } from 'react';
import { Footer, Layout, Navbar } from 'nextra-theme-docs';
import { getPageMap } from 'nextra/page-map';
import 'nextra-theme-docs/style.css';

export default async function DocsLayout({
    children,
}: {
    children: ReactNode;
}) {
    const pageMap = await getPageMap();

    return (
        <Layout
            docsRepositoryBase="https://github.com/eduardo202020/tech-lab/tree/main"
            editLink="Editar esta página"
            feedback={{ content: null }}
            footer={<Footer>Tech Lab © {new Date().getFullYear()}</Footer>}
            navbar={
                <Navbar
                    logo={<strong>Tech Lab · Guía de Usuario</strong>}
                    projectLink="https://github.com/eduardo202020/tech-lab"
                />
            }
            pageMap={pageMap}
            themeSwitch={{ dark: 'Oscuro', light: 'Claro', system: 'Sistema' }}
            toc={{ backToTop: 'Volver arriba', title: 'En esta página' }}
        >
            {children}
        </Layout>
    );
}