import { useContentfulInspectorMode } from '@contentful/live-preview/react';
import { twMerge } from 'tailwind-merge';

import { ComponentIframe } from '@src/lib/__generated/sdk';

interface ArticleIframeProps {
  iframe: ComponentIframe;
}

export const ArticleIframe = ({ iframe }: ArticleIframeProps) => {
  const inspectorProps = useContentfulInspectorMode({ entryId: iframe.sys.id });

  return iframe.iframeUrl ? (
    <div
      {...inspectorProps({ fieldId: 'iframeUrl' })}
      className={twMerge('flex flex-col items-center justify-center')}
    >
      <div className={twMerge('aspect-w-16 aspect-h-9 w-full overflow-hidden rounded-lg')}>
        <iframe
          title={iframe.componentName || 'Iframe'}
          src={iframe.iframeUrl}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  ) : null;
};
