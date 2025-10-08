import { useMemo } from 'react';
import { lazy, importer } from 'UI/Async';

export default function PageLoader(props: { pageId: string }) {
    const Page = useMemo(() => {
        const moduleName = 'RouterDemo/resources/' + props.pageId;
        return lazy(() => importer(moduleName));
    }, [props.pageId]);

    return <Page />;
}
