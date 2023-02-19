import React from "react";
import { ContentItem } from "../types";
import classes from "./ContentList.module.scss";
export interface ContentListProps {
  data: ContentItem[];
  title?: string;
  itemTitleKey: string;
  itemDescriptionKey?: string;
  itemClassName?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const ContentList: React.FC<ContentListProps> = ({
  data,
  itemTitleKey,
  itemDescriptionKey,
  itemClassName,
  className,
  style,
}) => {
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
