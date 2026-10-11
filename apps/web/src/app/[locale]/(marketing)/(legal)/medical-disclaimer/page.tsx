import { LegalPage, legalMetadata } from '../_components/legal-page';

export const generateMetadata = () => legalMetadata('medical-disclaimer');

export default function Page() {
  return <LegalPage slug="medical-disclaimer" />;
}
