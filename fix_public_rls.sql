-- Autoriser la lecture publique des événements (Pour que le mini-site s'affiche)
CREATE POLICY "Tout le monde peut voir un événement" 
ON public.events FOR SELECT USING (true);

-- Autoriser le public (les invités) à s'inscrire (Insérer dans guests)
CREATE POLICY "Les invités peuvent RSVP" 
ON public.guests FOR INSERT WITH CHECK (true);
