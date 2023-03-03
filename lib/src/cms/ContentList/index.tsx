import React from "react";
import { ContentItem } from "../../types";
import classes from "./ContentList.module.scss";

export interface ContentListProps {
  /** Content items to renderer  */
  items: ContentItem[];
  /** The title of the list, renderered above list items */
  header?: React.ReactNode; // this is a description
  /** The key of the content item's `data` to render as title */
  itemTitleKey: string;
  /** The key of the content item's `data` to render as description. If not provided, no description is rendered */
  itemDescriptionKey?: string;
  /** The class that will be merged onto the `li` element */
  itemClassName?: string;
  /** The class that will merged onto the outermost `ul`` element */
  className?: string;
  style?: React.CSSProperties;
}

/**
 * this is a component
 */
export const ContentList = ({
  items,
  itemTitleKey,
  itemDescriptionKey,
  itemClassName,
  className,
  style,
  header,
}: ContentListProps) => {
  return (
    <ul className={className ? classes.list : undefined} style={style}>
      {header && <div>{header}</div>}
      {items &&
        items.map((item) => (
          <li key={item.id} className={[classes.item, itemClassName].join(" ")}>
            {item.data?.[itemTitleKey]}
            {itemDescriptionKey && (
              <span className={[classes.description].join(" ")}>
                {item.data?.[itemDescriptionKey]}
              </span>
            )}
          </li>
        ))}
    </ul>
  );
};

export default ContentList;
