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
      <div className={twMerge('aspect-w-1 aspect-h-1 w-full overflow-hidden')}>
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
