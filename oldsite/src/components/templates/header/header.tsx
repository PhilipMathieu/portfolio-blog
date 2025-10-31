import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { SocialIcon } from 'react-social-icons';

import { Container } from 'oldsite/src/components/shared/container';

export const Header = () => {
  const { t } = useTranslation();

  return (
    <header className="py-5">
      <nav>
        <Container className="flex items-center justify-between">
          <Link href="/" title={t('common.homepage')} className="">
            <h1>Philip Englund Mathieu</h1>
          </Link>
          <div className="flex justify-end">
            <SocialIcon
              url="https://github.com/PhilipMathieu"
              className="mr-2"
              target="_blank"
              rel="noopener noreferrer"
            />
            <SocialIcon
              url="https://linkedin.com/in/PhilipMathieu"
              target="_blank"
              rel="noopener noreferrer"
            />
          </div>
        </Container>
      </nav>
    </header>
  );
};
