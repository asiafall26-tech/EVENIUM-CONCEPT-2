import CreateStudio from '@/components/create/CreateStudio';

/** Événement supplémentaire : même parcours que sur le site (modèles, personnalisation, paiement), sans création de compte. */
export default function NewEventPage() {
  return (
    <div className="w-full max-w-[1550px] mx-auto">
      <CreateStudio mode="dashboard" />
    </div>
  );
}
