import { LegalPage, legalMetadata } from '../_components/legal-page';
import { DeleteAccountForm } from './_components/delete-account-form';

export const generateMetadata = () => legalMetadata('delete-account');

// الكلام من الداشبورد زي باقي الصفحات القانونية، والفورم تحته
export default function Page() {
  return (
    <LegalPage slug="delete-account">
      <DeleteAccountForm />
    </LegalPage>
  );
}
