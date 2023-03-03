import React from "react";
import { ContentItem } from "../../types";
import classes from "./ContentList.module.scss";

export interface ContentListProps {
  /** Content items to renderer  */
  items: ContentItem[];
  /** The title of the list, renderered above list items */
  header?: React.ReactNode; // this is a description
  itemTitleKey: string;
  itemDescriptionKey?: string;
  itemClassName?: string;
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
            <span className={[classes.description].join(" ")}>
              {itemDescriptionKey && item.data?.[itemDescriptionKey]}
            </span>
          </li>
        ))}
    </ul>
  );
};

export default ContentList;
