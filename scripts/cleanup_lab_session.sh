#!/usr/bin/env bash
# Script interactivo para limpiar credenciales y dejar una PC de laboratorio segura
# Uso: chmod +x scripts/cleanup_lab_session.sh && ./scripts/cleanup_lab_session.sh

set -euo pipefail
IFS=$'\n\t'

echo "=== Cleanup Lab Session ==="
echo "Este script te ayudará a eliminar credenciales locales (git, npm, ssh) en esta máquina pública."
echo

confirm() {
  # confirm <message>
  read -r -p "$1 [y/N]: " reply
  [[ $reply =~ ^[Yy] ]] && return 0 || return 1
}

# 1) Limpiar configuración git local del repositorio actual
if git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
  echo "-> Repositorio git detectado: $(pwd)"
  if confirm "Quitar user.name/user.email configurados localmente (repo) ?"; then
    git config --local --unset user.name || true
    git config --local --unset user.email || true
    echo "  - Configuración git local removida."
  fi
else
  echo "-> No se detectó un repo git en $(pwd) (omitido)."
fi

# 2) Vaciar cache de credenciales de git y eliminar archivo ~/.git-credentials
echo "-> Limpiando helpers de credenciales de git (si aplica)"
git credential-cache exit || true

if [ -f "$HOME/.git-credentials" ]; then
  if confirm "Eliminar $HOME/.git-credentials ?"; then
    rm -f "$HOME/.git-credentials"
    echo "  - $HOME/.git-credentials eliminado"
  fi
fi

# Intentar rechazar credenciales almacenadas para github.com (no es garantizado para todos los helpers)
printf "protocol=https\nhost=github.com\n" | git credential reject 2>/dev/null || true

# 3) Limpiar ssh-agent y sugerir eliminar claves privadas (interactivo)
echo "-> Limpiando ssh-agent (elimina claves cargadas en memoria)"
ssh-add -D 2>/dev/null || true

if [ -d "$HOME/.ssh" ]; then
  echo "Contenido de ~/.ssh:"
  ls -la "$HOME/.ssh" || true
  if confirm "Deseas eliminar alguna clave privada en ~/.ssh? (SE SELECTIVO: no borrar claves del sistema)"; then
    echo "Introduce el nombre (o patrón) del archivo a eliminar, por ejemplo: id_rsa_personal or id_ed25519_mykey"
    read -r keypattern
    if [ -n "$keypattern" ]; then
      echo "Ejecutando: rm -i ~/.ssh/$keypattern"
      rm -i "$HOME/.ssh/$keypattern" || true
      echo "  - Operación completada (si hubo coincidencias)."
    else
      echo "  - Patrón vacío, omitiendo eliminación."
    fi
  fi
fi

# 4) npm logout / eliminar ~/.npmrc
if command -v npm >/dev/null 2>&1; then
  if confirm "Ejecutar 'npm logout' para limpiar sesión npm local?"; then
    npm logout --registry=https://registry.npmjs.org/ || true
    echo "  - npm logout ejecutado"
  fi
fi

if [ -f "$HOME/.npmrc" ]; then
  if confirm "Eliminar $HOME/.npmrc ? (contiene tokens)"; then
    rm -f "$HOME/.npmrc"
    echo "  - $HOME/.npmrc eliminado"
  fi
fi

# 5) Unset variables de entorno comunes en la sesión actual (no modifica archivos de shell)
echo "-> Eliminando variables de entorno sensibles en esta sesión (temporal)"
unset_vars=(GIT_AUTHOR_NAME GIT_AUTHOR_EMAIL GIT_COMMITTER_NAME GIT_COMMITTER_EMAIL NPM_TOKEN)
for v in "${unset_vars[@]}"; do
  unset "$v" 2>/dev/null || true
done
echo "  - Variables deshechas en la sesión actual. Si las configuraste en ~/.bashrc o ~/.zshrc, recuerda borrarlas de esos archivos."

# 6) Sugerencias para limpiar sesiones en el navegador (Supabase/OAuth)
cat <<'INSTRUCTIONS'

=== Limpieza en el navegador ===
Las aplicaciones (Supabase, GitHub, Google) mantienen sesiones en el navegador (cookies, localStorage).
Abre las DevTools (Console) en cada navegador donde entraste con tu cuenta y ejecuta lo siguiente para eliminar sesiones locales:

// Copia y pega en la consola del navegador (DevTools)
Object.keys(localStorage).filter(k => /supabase|sb|supabase.auth|sb:/.test(k)).forEach(k => { console.log('removing', k); localStorage.removeItem(k); });
// Además limpia cookies para el sitio actual (ejecuta en la consola del dominio de la app):
document.cookie.split(';').forEach(c => { document.cookie = c.replace(/=.*/, '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/'); });

INSTRUCTIONS

# 7) Recomendaciones finales
echo "\n=== Recomendaciones adicionales ==="
echo "- Cierra todas las ventanas del navegador y borra cookies si dejaste sesiones abiertas (Google, GitHub)."
echo "- Si configuraste git globalmente en esta máquina con tu nombre y no quieres afectar a otros, restaura esos valores manualmente o avisa al administrador." 
echo "- Si quieres que deje un commit "clean-up" en el repo que borre credenciales locales (ejemplo), ejecútalo desde el repo antes de salir."

echo "\nCleanup finalizado. Revise las instrucciones para limpiar el navegador y confirme que cerró sesión en los servicios web."

echo "(Script no elimina automáticamente todas las claves del sistema; actúa con cautela para no borrar archivos de otros usuarios)."

exit 0
