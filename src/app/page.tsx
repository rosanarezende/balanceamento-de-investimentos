import { redirect } from 'next/navigation';

export default function Home() {
  // Redirecionar para a página unificada de carteira
  redirect('/carteira');
}
