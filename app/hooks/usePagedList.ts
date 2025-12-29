import { useCallback, useEffect, useRef, useState } from "react";

type SpringPage<T> = {
    content: T[];
    number: number;
    last: boolean;
};

type FetchPage<T> = (page: number) => Promise<SpringPage<T>>;

type Options<T> = {
    /** Called on reset/replace. Default: replace with new content */
    mergeReplace?: (incoming: T[]) => T[];
    /** Called on append. Default: prev + incoming */
    mergeAppend?: (prev: T[], incoming: T[]) => T[];
    /** Optional: load more if list is not scrollable */
    autoFillIfNotScrollable?: boolean;
};

/**
 * Generic "infinite scroll pageable" hooks (works for chats, people, messages, etc.)
 * - requestSeq ignores stale responses
 * - supports replace (page 0) and append (page+1)
 * - can auto-load more if list isn't scrollable
 */
export function usePagedList<T>(
    fetchPage: FetchPage<T>,
    deps: any[],
    options: Options<T> = {}
) {
    const {
        mergeReplace = (incoming) => incoming,
        mergeAppend = (prev, incoming) => [...prev, ...incoming],
        autoFillIfNotScrollable = true,
    } = options;

    const [items, setItems] = useState<T[]>([]);
    const [page, setPage] = useState(0);
    const [last, setLast] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    const [listHeight, setListHeight] = useState(0);
    const [contentHeight, setContentHeight] = useState(0);

    const requestSeq = useRef(0);

    const loadAndReplacePage = useCallback(
        async (pageToLoad: number) => {
            if (loading) return;

            const seq = ++requestSeq.current;

            try {
                setLoading(true);

                const data = await fetchPage(pageToLoad);
                if (seq !== requestSeq.current) return;

                setPage(data.number);
                setLast(data.last);
                setItems(mergeReplace(data.content));
            } finally {
                setLoading(false);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [fetchPage, loading, ...deps]
    );

    const loadPage = useCallback(
        async (pageToLoad: number) => {
            if (loadingMore || last) return;

            const seq = ++requestSeq.current;

            try {
                setLoadingMore(true);

                const data = await fetchPage(pageToLoad);
                if (seq !== requestSeq.current) return;

                setPage(data.number);
                setLast(data.last);

                setItems((prev) => mergeAppend(prev, data.content));
            } finally {
                setLoadingMore(false);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [fetchPage, loadingMore, last, ...deps]
    );

    const onEndReached = useCallback(() => {
        if (loading || loadingMore || last) return;
        loadPage(page + 1);
    }, [loading, loadingMore, last, loadPage, page]);

    const onLayout = useCallback((e: any) => {
        setListHeight(e.nativeEvent.layout.height);
    }, []);

    const onContentSizeChange = useCallback((_: number, h: number) => {
        setContentHeight(h);
    }, []);

    const maybeLoadMore = useCallback(() => {
        if (!autoFillIfNotScrollable) return;

        const notScrollable = contentHeight > 0 && contentHeight <= listHeight;
        if (notScrollable && !loading && !loadingMore && !last) {
            loadPage(page + 1);
        }
    }, [autoFillIfNotScrollable, contentHeight, listHeight, loading, loadingMore, last, loadPage, page]);

    const resetAndLoadFirstPage = useCallback(() => {
        setItems([]);
        setPage(0);
        setLast(false);
        loadAndReplacePage(0);
    }, [loadAndReplacePage]);

    // reset when deps change (query/id etc.)
    useEffect(() => {
        resetAndLoadFirstPage();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    // auto-fill if not scrollable
    useEffect(() => {
        maybeLoadMore();
    }, [maybeLoadMore]);

    return {
        items,
        setItems, // useful for optimistic updates (messages)
        page,
        last,
        loading,
        loadingMore,

        loadAndReplacePage,
        loadPage,
        resetAndLoadFirstPage,

        onEndReached,
        onLayout,
        onContentSizeChange,
    };
}
