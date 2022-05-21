import React from "react";
import classnames from "classnames";

// Source: Material Design person icon
// https://material.io/resources/icons/?search=person&style=baseline

export default ({ className = "h-full w-full" }) => (
  <svg
    className={classnames(className, "fill-current")}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
  </svg>
);
