import { Metadata } from 'next';
import { Shield, Lock, Key, FileText, Server, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sécurité & Confidentialité | Aurum Sanctuary',
  description: 'Comment Aurum protège vos pensées avec une architecture Zero-Knowledge et un chiffrement AES-256 côté client.',
};

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
      {/* Hero */}
      <section className="py-24 md:py-32">
        <div className="container max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-8">
            <Shield className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight mb-6">
            Comment Aurum protège vos pensées
          </h1>
          <p className="text-xl text-stone-600 max-w-2xl mx-auto">
            Votre monde intérieur est sacré. Nous avons construit une architecture où{' '}
            <strong className="text-primary">même nous ne pouvons pas accéder à vos données</strong>.
          </p>
        </div>
      </section>

      {/* Architecture Zero-Knowledge */}
      <section className="py-16 border-t border-stone-200">
        <div className="container max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 border border-stone-100">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-headline font-bold mb-3">Architecture Zero-Knowledge</h2>
                <p className="text-lg text-stone-600">
                  Vos entrées de journal sont <strong>chiffrées sur votre appareil</strong> avant d'être envoyées à nos serveurs.
                  La clé de déchiffrement ne quitte jamais votre navigateur.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="bg-stone-50 rounded-xl p-6 border border-stone-100">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-stone-900">Chiffrement AES-256-GCM</h3>
                </div>
                <p className="text-sm text-stone-600">
                  Standard militaire utilisé par les banques et gouvernements. Vos données sont protégées par l'un des algorithmes les plus robustes au monde.
                </p>
              </div>

              <div className="bg-stone-50 rounded-xl p-6 border border-stone-100">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-stone-900">Dérivation PBKDF2</h3>
                </div>
                <p className="text-sm text-stone-600">
                  Votre passphrase est transformée en clé via 210 000 itérations, rendant les attaques par force brute extrêmement coûteuses.
                </p>
              </div>

              <div className="bg-stone-50 rounded-xl p-6 border border-stone-100">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-stone-900">Admin-Blind</h3>
                </div>
                <p className="text-sm text-stone-600">
                  Même avec un accès total aux serveurs, aucun administrateur ne peut déchiffrer vos écrits sans votre passphrase.
                </p>
              </div>

              <div className="bg-stone-50 rounded-xl p-6 border border-stone-100">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-stone-900">Phrase de récupération BIP39</h3>
                </div>
                <p className="text-sm text-stone-600">
                  12 mots générés lors de la configuration vous permettent de récupérer vos données sur un nouvel appareil.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comment ça fonctionne */}
      <section className="py-16">
        <div className="container max-w-4xl mx-auto">
          <h2 className="text-3xl font-headline font-bold text-center mb-12">
            Le parcours de vos données
          </h2>

          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  1
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Vous écrivez dans votre journal</h3>
                <p className="text-stone-600">
                  Votre entrée reste en texte clair dans votre navigateur pendant que vous écrivez.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  2
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Chiffrement côté client</h3>
                <p className="text-stone-600">
                  Avant l'envoi, votre entrée est chiffrée avec votre clé privée (dérivée de votre passphrase).
                  Le texte devient illisible : une suite de caractères aléatoires.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  3
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Stockage sécurisé</h3>
                <p className="text-stone-600">
                  Les données chiffrées sont sauvegardées sur Firebase (Google Cloud, certifié ISO 27001).
                  Même en cas de piratage serveur, vos pensées restent illisibles.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  4
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Déchiffrement local</h3>
                <p className="text-stone-600">
                  Quand vous vous reconnectez, vous saisissez votre passphrase. Votre clé est régénérée localement
                  pour déchiffrer vos entrées. Personne d'autre ne peut le faire.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Sécurité */}
      <section className="py-16 bg-stone-50 border-t border-stone-200">
        <div className="container max-w-4xl mx-auto">
          <h2 className="text-3xl font-headline font-bold text-center mb-12">
            Questions fréquentes
          </h2>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-stone-100">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Key className="w-5 h-5 text-primary" />
                Pouvez-vous lire mes données ?
              </h3>
              <p className="text-stone-600">
                <strong>Non.</strong> Nous utilisons une architecture "Admin-Blind" avec chiffrement AES-256 côté client.
                Vos entrées sont chiffrées avec votre clé privée avant d'être envoyées.
                Techniquement, même avec un accès total à nos serveurs, il est <strong>impossible</strong> de déchiffrer
                vos écrits sans votre passphrase.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-stone-100">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Que se passe-t-il si je perds mon appareil ?
              </h3>
              <p className="text-stone-600">
                Lors de votre première configuration, vous recevez une <strong>phrase de récupération de 12 mots</strong> (BIP39).
                Conservez-la dans un endroit sûr (coffre-fort, gestionnaire de mots de passe).
                Si vous perdez votre appareil, vous pouvez utiliser cette phrase pour régénérer votre clé sur un nouveau device.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-stone-100">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Server className="w-5 h-5 text-primary" />
                Où sont stockées mes données ?
              </h3>
              <p className="text-stone-600">
                Vos données chiffrées sont stockées sur <strong>Firebase (Google Cloud)</strong>, certifié ISO 27001, SOC 2 et RGPD-compliant.
                Les serveurs sont situés aux États-Unis (us-central1).
                Rappel : même Google ne peut pas déchiffrer vos entrées.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-stone-100">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Que se passe-t-il si j'oublie ma passphrase ET ma phrase de récupération ?
              </h3>
              <p className="text-stone-600">
                Nous ne pouvons pas récupérer vos données. C'est le prix de la confidentialité absolue :
                <strong> personne ne peut déchiffrer vos pensées, même vous</strong> si vous perdez vos clés.
                C'est pourquoi nous recommandons de sauvegarder votre phrase de récupération dans un endroit sûr.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16">
        <div className="container max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-headline font-bold mb-8">Standards de sécurité</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-3">
                <Shield className="w-8 h-8 text-stone-600" />
              </div>
              <p className="text-sm font-semibold">AES-256-GCM</p>
              <p className="text-xs text-stone-500">Chiffrement militaire</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-3">
                <Lock className="w-8 h-8 text-stone-600" />
              </div>
              <p className="text-sm font-semibold">PBKDF2-SHA256</p>
              <p className="text-xs text-stone-500">210k itérations</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-3">
                <Key className="w-8 h-8 text-stone-600" />
              </div>
              <p className="text-sm font-semibold">BIP39</p>
              <p className="text-xs text-stone-500">Récupération standard</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-3">
                <Server className="w-8 h-8 text-stone-600" />
              </div>
              <p className="text-sm font-semibold">ISO 27001</p>
              <p className="text-xs text-stone-500">Google Cloud</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-white">
        <div className="container max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">
            Prêt à protéger vos pensées ?
          </h2>
          <p className="text-lg mb-8 text-white/90">
            Créez votre sanctuaire privé en quelques secondes. Aucune carte bancaire requise.
          </p>
          <a
            href="/sanctuary/write"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary rounded-full font-semibold hover:bg-stone-100 transition-colors"
          >
            Entrer dans le Sanctuaire
          </a>
        </div>
      </section>
    </div>
  );
}
