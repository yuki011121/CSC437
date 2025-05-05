// src/styles/reset.css.ts
import { css } from "lit";

const styles = css`
  * {
    margin: 0;
    box-sizing: border-box;
  }
  img {
    max-width: 100%;
  }
  ul,
  menu {
    list-style: none; 
    padding: 0;
  }
  a {
     text-decoration: none;
     color: inherit; 
  }
`;

export default styles; 