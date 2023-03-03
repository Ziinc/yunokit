import React from "react";
import { ContentItem } from "../../types";
import classes from "./ContentList.module.scss";

export interface ContentListProps {
  // testing props
  data: ContentItem[];
  /** some description */
  title?: string; // this is a description
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
  data,
  itemTitleKey,
  itemDescriptionKey,
  itemClassName,
  className,
  style,
}: ContentListProps) => {
  return (
    <ul className={className ? classes.list : undefined} style={style}>
      {data.map((item) => (
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
