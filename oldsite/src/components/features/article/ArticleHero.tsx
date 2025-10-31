import { useContentfulInspectorMode } from '@contentful/live-preview/react';
import { useTranslation } from 'next-i18next';
import { twMerge } from 'tailwind-merge';

import { ArticleAuthor } from 'oldsite/src/components/features/article/ArticleAuthor';
import { ArticleLabel } from 'oldsite/src/components/features/article/ArticleLabel';
import { CtfImage } from 'oldsite/src/components/features/contentful';
import { FormatDate } from 'oldsite/src/components/shared/format-date';
import { PageBlogPostFieldsFragment } from 'oldsite/src/lib/__generated/sdk';

interface ArticleHeroProps {
  article: PageBlogPostFieldsFragment;
  isFeatured?: boolean;
  isReversedLayout?: boolean;
}
export const ArticleHero = ({
  article,
  isFeatured,
  isReversedLayout = false,
}: ArticleHeroProps) => {
  const { t } = useTranslation();
  const inspectorProps = useContentfulInspectorMode({ entryId: article.sys.id });

  const { title, shortDescription, publishedDate } = article;

  return (
    <div
      className={twMerge(
        `hover:border-black flex flex-col overflow-hidden border-2 border-gray500 shadow-sm`,
        isReversedLayout ? 'lg:flex-row-reverse' : 'lg:flex-row',
      )}
    >
      <div className="flex-1 basis-1/2" {...inspectorProps({ fieldId: 'featuredImage' })}>
        {article.featuredImage && (
          <CtfImage
            nextImageProps={{ className: 'w-full', priority: true, sizes: undefined }}
            {...article.featuredImage}
          />
        )}
      </div>

      <div className="relative flex flex-1 basis-1/2 flex-col justify-center py-6 px-4 lg:px-16 lg:py-12 xl:px-24">
        <div className="mb-2 flex flex-wrap items-center">
          <ArticleAuthor article={article} />
          {isFeatured && (
            <ArticleLabel
              className={twMerge(
                'ml-auto pl-2 lg:absolute lg:top-8 xl:top-12',
                isReversedLayout ? 'lg:left-6 xl:left-12' : 'lg:right-6 xl:right-12',
              )}
            >
              {t('article.featured')}
            </ArticleLabel>
          )}
          <div
            className={twMerge(
              'ml-auto hidden pl-2 text-xs text-gray600',
              isReversedLayout ? 'lg:block' : '',
            )}
            {...inspectorProps({ fieldId: 'publishedDate' })}
          >
            <FormatDate date={publishedDate} />
          </div>
        </div>
        <h1 {...inspectorProps({ fieldId: 'title' })}>{title}</h1>
        {shortDescription && (
          <p className="mt-2" {...inspectorProps({ fieldId: 'shortDescription' })}>
            {shortDescription}
          </p>
        )}
        <div
          className={twMerge('mt-2 text-xs text-gray600', isReversedLayout ? 'lg:hidden' : '')}
          {...inspectorProps({ fieldId: 'publishedDate' })}
        >
          <FormatDate date={publishedDate} />
        </div>
      </div>
    </div>
  );
};
