import { Button } from '@/components/ui/button';
import { UserButton } from '@clerk/nextjs';

export default function Home() {
  return (
    <main>
      <UserButton afterSignOutUrl="/" />
      <Button variant={'destructive'}>하이하이하이</Button>
    </main>
  );
}
