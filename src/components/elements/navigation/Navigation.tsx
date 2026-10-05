'use client';

import { ThemeToggle } from '@/theme/components/theme-toggle/ThemeToggle';
import { navigationVariants } from './styles';
import { ROUTES } from '@/config/routes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
	{ href: ROUTES.search, label: 'Search' },
	{ href: ROUTES.documents, label: 'Documents' }
] as const;

export const Navigation = () => {
	const pathname = usePathname();
	const styles = navigationVariants();

	return (
		<nav className={styles.nav()}>
			<div className={styles.inner()}>
				<div className={styles.links()}>
					{NAV_ITEMS.map((item) => {
						const isActive = pathname === item.href;
						return (
							<Link key={item.href} href={item.href} className={navigationVariants({ isActive }).link()}>
								{item.label}
							</Link>
						);
					})}
				</div>
				<div className={styles.actions()}>
					<ThemeToggle />
				</div>
			</div>
		</nav>
	);
};
