import { useTranslation } from 'next-i18next';
import { SocialIcon } from 'react-social-icons';

import { Container } from '@src/components/shared/container';

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="border-t-color mt-10 border-t border-gray200">
      <Container className="flex-items-center flex justify-between py-8">
        <h2 className="h4 mb-4">{t('footer.aboutUs')}</h2>
        <div className="max-w-4xl">
          I am a data science graduate student at The Roux Institute, Northeastern University&apos;s
          campus in Portland, ME. I am seeking full-time opportunities starting in late spring 2024.
          To get a sense of my project experience and skills, please refer to{' '}
          <a href="https://github.com/PhilipMathieu" target="_blank" rel="noopener noreferrer">
            my GitHub profile
          </a>
          . For a broader sense of my professional experience,{' '}
          <a href="https://linkedin.com/in/PhilipMathieu" target="_blank" rel="noopener noreferrer">
            connect with me on LinkedIn
          </a>
          .
        </div>
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
    </footer>
  );
};
