import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Menu = () => {
  const router = useRouter();

  return (
    <nav className="menu">
      <ul>
        <li className={router.pathname === '/' ? 'active' : ''}>
          <Link href="/">Home</Link>
        </li>
        <li className={router.pathname === '/calculadora-balanceamento' ? 'active' : ''}>
          <Link href="/calculadora-balanceamento">Calculadora de Balanceamento</Link>
        </li>
        <li className={router.pathname === '/historico' ? 'active' : ''}>
          <Link href="/historico">Histórico</Link>
        </li>
        <li className={router.pathname === '/perfil' ? 'active' : ''}>
          <Link href="/perfil">Perfil</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Menu;
