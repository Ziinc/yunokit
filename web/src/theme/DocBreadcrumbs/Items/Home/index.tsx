import React, {type ReactNode} from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {translate} from '@docusaurus/Translate';
import IconHome from '@theme/Icon/Home';

import styles from './styles.module.css';

export default function HomeBreadcrumbItem(): ReactNode {
  
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  
  const homeHref = useBaseUrl(currentPath.startsWith('/reference') ? '/reference' : '/');

  return (
    <li className="breadcrumbs__item">
      <Link
        aria-label={translate({
          id: 'theme.docs.breadcrumbs.home',
          message: 'Home page',
          description: 'The ARIA label for the home page in the breadcrumbs',
        })}
        className="breadcrumbs__link p-0"
        href={homeHref}>
        <IconHome className={styles.breadcrumbHomeIcon} />
      </Link>
    </li>
  );
}
