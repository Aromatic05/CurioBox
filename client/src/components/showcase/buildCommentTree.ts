import type { IComment } from "../../api/showcaseApi";

export type CommentTree = IComment & { children: CommentTree[] };

export function buildCommentTree(flatComments: IComment[]): Array<CommentTree> {
    const map = new Map<number, CommentTree>();
    const roots: Array<CommentTree> = [];
    flatComments.forEach((c) => {
        map.set(c.id, { ...c, children: [] });
    });
    map.forEach((comment) => {
        if (comment.parentId && map.has(comment.parentId)) {
            map.get(comment.parentId)!.children.push(comment);
        } else {
            roots.push(comment);
        }
    });
    return roots;
}
