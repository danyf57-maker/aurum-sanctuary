
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Conditions Générales d\'Utilisation | Aurum',
  description: 'Consultez les conditions générales d\'utilisation du service Aurum.',
};

export default function TermsOfServicePage() {
  return (
    <div className="bg-stone-50/50 min-h-screen">
      <div className="container max-w-4xl mx-auto py-20 md:py-28 animate-fade-in">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-headline leading-tight tracking-tight mb-4">
            Conditions Générales d'Utilisation
          </h1>
          <p className="text-muted-foreground">Dernière mise à jour : 25 juillet 2024</p>
        </header>

        <div className="prose prose-lg prose-stone font-body mx-auto">
          <h2>1. Objet du service</h2>
          <p>
            Aurum est une application de journal intime conçue comme un outil d'introspection personnelle. Le service est fourni à titre de démonstration et "en l'état", sans garantie de disponibilité ou de performance.
          </p>

          <h2>2. Accès et Compte Utilisateur</h2>
          <p>
            L'accès aux fonctionnalités de base est possible sans compte. La création d'un compte utilisateur est nécessaire pour sauvegarder les entrées et accéder aux fonctionnalités personnalisées. Vous êtes responsable de la sécurité de votre compte et de vos identifiants de connexion. Vous vous engagez à ne pas utiliser le service à des fins illégales ou non autorisées.
          </p>
            
          <h2>3. Contenu de l'utilisateur</h2>
          <p>
            Vous conservez l'entière propriété intellectuelle du contenu que vous créez sur Aurum. En utilisant le service, vous nous accordez une licence limitée, non-exclusive et mondiale, uniquement dans le but de vous fournir le service (stockage, affichage, analyse par le moteur Aurum pour vos propres insights). Nous ne revendiquons aucun droit sur votre contenu.
          </p>

          <h2>4. Analyse et Reflets</h2>
          <p>
            Aurum utilise un moteur d'analyse pour vous fournir des insights. Ces reflets sont générés automatiquement et ne doivent pas être considérés comme des conseils médicaux, psychologiques ou professionnels. Ils sont un outil de réflexion et non un diagnostic. Vous reconnaissez que ces réponses peuvent parfois être imprécises ou non pertinentes.
          </p>
            
          <h2>5. Propriété Intellectuelle d'Aurum</h2>
          <p>
            L'application, son design, ses logos, textes (hors contenu utilisateur) et son code source sont la propriété exclusive du projet Aurum. Toute reproduction ou distribution non autorisée est strictement interdite.
          </p>

          <h2>6. Responsabilité</h2>
          <p>
            Aurum est un outil d'accompagnement et ne remplace en aucun cas un professionnel de la santé mentale. Nous ne pouvons être tenus responsables des décisions ou actions que vous prenez sur la base des informations ou insights fournis par l'application. Le service est fourni "tel quel" sans aucune garantie d'aucune sorte.
          </p>
            
          <h2>7. Résiliation</h2>
          <p>
            Vous pouvez cesser d'utiliser le service et supprimer votre compte à tout moment depuis la page "Mes Données". Nous nous réservons le droit de suspendre ou de résilier votre accès au service en cas de violation de ces conditions.
          </p>

          <h2>8. Modification des conditions</h2>
          <p>
            Nous nous réservons le droit de modifier ces conditions à tout moment. Nous vous informerons de tout changement substantiel. La poursuite de l'utilisation du service après modification vaut acceptation des nouvelles conditions.
          </p>
            
          <h2>9. Droit applicable</h2>
          <p>
            Ces conditions sont régies par le droit français. Tout litige relatif à leur interprétation ou exécution relèvera de la compétence des tribunaux de Paris.
          </p>
        </div>
      </div>
    </div>
  );
}
