import { documentToReactComponents, Options } from '@contentful/rich-text-react-renderer';
import { BLOCKS, Document } from '@contentful/rich-text-types';

import { ArticleImage, ArticleIframe, ArticleVideo } from 'oldsite/src/components/features/article';
import { ComponentRichImage, ComponentIframe, ComponentVideoEmbed } from 'oldsite/src/lib/__generated/sdk';

const find = (array, condition) => {
  return array.find(item => condition(item));
};

export type EmbeddedEntryType = ComponentRichImage | ComponentIframe | ComponentVideoEmbed;

export interface ContentfulRichTextInterface {
  json: Document;
  links?:
    | {
        entries: {
          block: Array<EmbeddedEntryType>;
        };
      }
    | any;
}

export const EmbeddedEntry = (entry: EmbeddedEntryType) => {
  switch (entry?.__typename) {
    case 'ComponentRichImage':
      return <ArticleImage image={entry} />;
    case 'ComponentIframe':
      return <ArticleIframe iframe={entry} />;
    case 'ComponentVideoEmbed':
      return <ArticleVideo video={entry} />;
    default:
      return null;
  }
};

export const contentfulBaseRichTextOptions = ({ links }: ContentfulRichTextInterface): Options => ({
  renderNode: {
    [BLOCKS.EMBEDDED_ENTRY]: node => {
      const entry = links?.entries?.block?.find(
        (item: EmbeddedEntryType) => item?.sys?.id === node.data.target.sys.id,
      );

      if (!entry) return null;
      return <EmbeddedEntry {...entry} />;
    },
    [BLOCKS.PARAGRAPH]: (node, children) => {
      // Check if the whole paragraph is code
      // @ts-ignore
      if (find(node.content[0].marks, mark => mark.type === 'code')) {
        return <pre className="prose-code lg:prose-xl">{children}</pre>;
      }
      return <p>{children}</p>;
    },
  },
});

export const CtfRichText = ({ json, links }: ContentfulRichTextInterface) => {
  const baseOptions = contentfulBaseRichTextOptions({ links, json });

  return (
    <article className="prose max-w-none">{documentToReactComponents(json, baseOptions)}</article>
  );
};
