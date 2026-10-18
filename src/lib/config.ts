/**
 * Build-time feature flags.
 *
 * Admin tools are compiled in only for development builds or when
 * NEXT_PUBLIC_OBSCURA_ADMIN=1. A production build without that variable has
 * the admin code tree-shaken out, so normal users never receive it.
 */
export const ADMIN_ENABLED: boolean =
  process.env.NEXT_PUBLIC_OBSCURA_ADMIN === '1' || process.env.NODE_ENV === 'development';

export const STORAGE_PREFIX = 'obscura:v1:';
