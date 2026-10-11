import { LegalPage, legalMetadata } from '../_components/legal-page';

export const generateMetadata = () => legalMetadata('privacy');

export default function Page() {
  return <LegalPage slug="privacy" />;
}
