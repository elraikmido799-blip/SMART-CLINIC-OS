import type { Specialty } from '@oxygen/config';
import type { OnlineConsultation, PublicBranch, PublicDoctor, PublicService } from '@/types/public';

/**
 * الداتا اللي الـWizard محتاجها، بتتجاب مرة واحدة على السيرفر (book/page.tsx) وتتبعت له.
 * المواعيد بس هي اللي بتتجاب من المتصفح (بتتغير كل دقيقة).
 */
export type BookingCatalog = {
  services: PublicService[];
  branches: PublicBranch[];
  doctors: PublicDoctor[];
  online: OnlineConsultation['specialties'];
  onlineCurrency: string;
  // للعرض في الملخص لو جاي من صفحة برنامج (?program=)
  programs: { slug: string; name_ar: string; name_en: string; specialty: Specialty | null }[];
};
