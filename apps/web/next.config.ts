import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: { formats: ['image/avif', 'image/webp'] },
  turbopack: {
    resolveAlias: {
      /*
       * ده نفس اللي بيعمله next-intl/plugin بالظبط مع إعداداتنا.
       * مش بنستخدم الـplugin نفسه لأنه بيحمّل @swc/core أول ما يشتغل، و@swc/core بيرفض يشتغل
       * لو صلاحيات أي فولدر فوق الـcache بتاعه مفتوحة (زي D:\ و AppData\Local على الجهاز ده).
       */
      'next-intl/config': './src/i18n/request.ts',
    },
  },
};

export default nextConfig;
