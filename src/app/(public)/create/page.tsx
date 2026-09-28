import { redirect } from 'next/navigation';

export default function CreateEventRoot() {
  // Redirect to the first step of the wizard
  redirect('/create/step-1');
}
