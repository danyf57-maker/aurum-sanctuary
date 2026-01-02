
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Politique de Confidentialité | Aurum',
  description: 'Découvrez comment Aurum protège vos données personnelles, conformément au RGPD.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-stone-50/50 min-h-screen">
      <div className="container max-w-4xl mx-auto py-20 md:py-28 animate-fade-in">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-headline leading-tight tracking-tight mb-4">
            Politique de Confidentialité
          </h1>
          <p className="text-muted-foreground">Dernière mise à jour : 25 juillet 2024</p>
        </header>

        <div className="prose prose-stone lg:prose-lg font-body mx-auto">
          <p>
            Bienvenue sur Aurum. Votre vie privée est au cœur de nos préoccupations. Cette politique de confidentialité a pour but de vous informer de manière transparente sur la manière dont nous collectons, utilisons et protégeons vos données personnelles, conformément au Règlement Général sur la Protection des Données (RGPD).
          </p>

          <h2>1. Responsable du traitement</h2>
          <p>
            L'application Aurum est un projet de démonstration. Dans ce cadre, le responsable du traitement de vos données personnelles est :
          </p>
          <p>
            <strong>Aurum Demo Project</strong><br />
            Adresse fictive : 123 Rue du Sanctuaire, 75001 Paris, France<br />
            Email de contact : <a href="mailto:privacy@aurum.dev">privacy@aurum.dev</a>
          </p>

          <h2>2. Données collectées et finalités</h2>
          <p>
            Nous ne collectons que les données strictement nécessaires à la fourniture de nos services.
          </p>
          <ul>
            <li>
              <strong>Données de compte :</strong> Lors de la création de votre compte (via Google ou e-mail), nous collectons votre identifiant utilisateur, adresse e-mail, nom d'affichage et URL de photo de profil. Ces données sont utilisées pour vous authentifier, sécuriser votre compte et personnaliser votre expérience.
            </li>
            <li>
              <strong>Contenu des entrées de journal :</strong> Le contenu que vous écrivez dans votre journal est votre propriété. Nous le stockons de manière sécurisée pour que vous puissiez y accéder. Nous utilisons une analyse par intelligence artificielle (IA) de manière automatisée et anonymisée pour en extraire des indicateurs (sentiment, humeur, insights) qui vous sont restitués. À aucun moment un être humain n'accède au contenu de vos entrées.
            </li>
            <li>
              <strong>Données d'utilisation et cookies :</strong> Nous utilisons des traceurs (comme le localStorage) pour des fonctionnalités essentielles, telles que le maintien de votre session de connexion ou la gestion de votre consentement aux cookies. Nous n'utilisons pas de cookies de suivi publicitaire.
            </li>
          </ul>

          <h2>3. Base légale du traitement</h2>
          <p>
            Le traitement de vos données repose sur les bases légales suivantes :
          </p>
          <ul>
            <li>
              <strong>L'exécution d'un contrat :</strong> Le traitement de vos données de compte et de vos entrées est nécessaire pour fournir le service de journal intime auquel vous souscrivez en utilisant Aurum.
            </li>
            <li>
              <strong>Votre consentement :</strong> Pour le dépôt de cookies non essentiels et pour certaines fonctionnalités futures qui pourraient le requérir.
            </li>
             <li>
              <strong>Notre intérêt légitime :</strong> Pour assurer la sécurité de notre service et réaliser des statistiques anonymes d'utilisation.
            </li>
          </ul>

          <h2>4. Durée de conservation</h2>
          <p>
            Vos données sont conservées pour les durées suivantes :
          </p>
          <ul>
            <li>
              <strong>Données de compte et entrées de journal :</strong> Tant que votre compte est actif. En cas d'inactivité prolongée (3 ans), nous pourrons vous notifier avant de procéder à la suppression de votre compte. Vous pouvez supprimer votre compte et toutes vos données à tout moment depuis la page <Link href="/account/data">"Mes Données"</Link>.
            </li>
            <li>
              <strong>Cookies :</strong> La durée de vie des cookies est de 13 mois maximum.
            </li>
          </ul>

          <h2>5. Vos droits en tant qu'utilisateur</h2>
          <p>
            Conformément au RGPD, vous disposez des droits suivants sur vos données :
          </p>
          <ul>
            <li><strong>Droit d'accès :</strong> Le droit de savoir quelles données nous détenons sur vous.</li>
            <li><strong>Droit de rectification :</strong> Le droit de corriger des données inexactes.</li>
            <li><strong>Droit à l'effacement ("droit à l'oubli") :</strong> Le droit de demander la suppression de vos données.</li>
            <li><strong>Droit à la portabilité :</strong> Le droit de recevoir vos données dans un format structuré et courant (JSON).</li>
            <li><strong>Droit à la limitation du traitement et Droit d'opposition.</strong></li>
          </ul>
          <p>
            Vous pouvez exercer les droits d'accès, de portabilité et de suppression directement depuis votre page <Link href="/account/data">"Mes Données"</Link>. Pour tout autre droit, veuillez nous contacter à <a href="mailto:privacy@aurum.dev">privacy@aurum.dev</a>.
          </p>

          <h2>6. Sécurité des données</h2>
          <p>
            Nous prenons la sécurité de vos données très au sérieux. Nous utilisons Firebase de Google, une plateforme reconnue pour sa robustesse. Les communications sont chiffrées (HTTPS), et nous mettons en œuvre des règles de sécurité strictes pour empêcher tout accès non autorisé à vos données.
          </p>

          <h2>7. Transfert de données hors de l'Union Européenne</h2>
           <p>
            Nos services sont hébergés sur Google Cloud Platform, dont les serveurs peuvent être situés en dehors de l'UE. Google adhère à des mécanismes de transfert de données approuvés (tels que les Clauses Contractuelles Types) pour garantir un niveau de protection de vos données équivalent à celui exigé par le RGPD.
          </p>

           <h2>8. Délégué à la Protection des Données (DPO)</h2>
           <p>
             Pour toute question relative à la protection de vos données, vous pouvez contacter notre Délégué à la Protection des Données (DPO) fictif à l'adresse suivante : <a href="mailto:dpo@aurum.dev">dpo@aurum.dev</a>.
           </p>
        </div>
      </div>
    </div>
  );
}
