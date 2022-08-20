import { useStore } from "../../store";
import { Button } from "@jpmorganchase/uitk-core";
import { FC, SVGAttributes } from "react";
import { observer } from "mobx-react-lite";
import { Icon } from "@jpmorganchase/uitk-icons";

const Moon = (props: SVGAttributes<SVGElement>) => (
  <Icon>
    <svg viewBox="0 0 48 48" fill="currentColor" {...props}>
      <g>
        <path d="M42.9714 31.0742C42.9098 30.7177 42.7546 30.4149 42.5074 30.1655C41.9593 29.6133 41.3228 29.4974 40.5981 29.8179C38.6533 30.7261 36.6372 31.1798 34.5512 31.1798C31.9344 31.1798 29.5211 30.5305 27.3111 29.2304C25.1012 27.9306 23.3511 26.168 22.0605 23.9421C20.7694 21.7163 20.1243 19.2859 20.1243 16.6505C20.1243 14.6029 20.5268 12.6576 21.331 10.8146C22.1355 8.97169 23.2981 7.35583 24.8184 5.96692C25.402 5.41517 25.5349 4.77399 25.2166 4.04384C24.916 3.31407 24.3768 2.96701 23.5989 3.00246C20.8939 3.1092 18.3302 3.71942 15.9079 4.83189C13.4857 5.94465 11.4038 7.40887 9.6622 9.22539C7.92079 11.0415 6.54156 13.1917 5.52488 15.6755C4.50848 18.1595 4 20.7636 4 23.4879C4 26.2657 4.53932 28.9187 5.61777 31.4471C6.6965 33.9756 8.14605 36.1567 9.96725 37.9907C11.7883 39.8242 13.9541 41.2843 16.465 42.3709C18.9756 43.4567 21.6096 44 24.3676 44C28.3284 44 31.9834 42.9183 35.3336 40.7548C38.6841 38.5916 41.1904 35.7026 42.8525 32.088C42.9941 31.7678 43.0338 31.4298 42.9714 31.0742ZM31.6211 38.9382C29.3317 40.0337 26.9138 40.5811 24.3676 40.5811C22.0692 40.5811 19.8727 40.1271 17.7773 39.2192C15.6823 38.3113 13.8787 37.0961 12.3669 35.5735C10.8555 34.0512 9.64901 32.2351 8.74696 30.1251C7.84527 28.015 7.39439 25.8029 7.39439 23.488C7.39439 19.6599 8.52161 16.2412 10.7759 13.2318C13.0299 10.2228 15.9341 8.18401 19.4878 7.11569C17.6491 10.0536 16.7295 13.2318 16.7295 16.6507C16.7295 19.8916 17.5251 22.8918 19.1165 25.6522C20.7076 28.4118 22.8736 30.5926 25.6142 32.1957C28.3544 33.7981 31.333 34.5993 34.5512 34.5993C35.5411 34.5993 36.5139 34.5193 37.4687 34.3589C35.8601 36.3176 33.9104 37.8441 31.6211 38.9382Z" />
      </g>
    </svg>
  </Icon>
);

const Sun = (props: SVGAttributes<SVGElement>) => (
  <Icon>
    <svg viewBox="0 0 48 48" fill="currentColor" {...props}>
      <g>
        <path d="M24 34.4558C29.7674 34.4558 34.4186 29.7674 34.4186 24.0372C34.4186 18.307 29.7302 13.6186 24 13.6186C18.2698 13.6186 13.5814 18.307 13.5814 24.0372C13.5814 29.7674 18.2326 34.4558 24 34.4558ZM24 16.6326C28.093 16.6326 31.4046 19.9442 31.4046 24.0372C31.4046 28.1302 28.093 31.4419 24 31.4419C19.907 31.4419 16.5953 28.1302 16.5953 24.0372C16.5953 19.9442 19.907 16.6326 24 16.6326Z" />
        <path d="M25.5256 8.7814V3.9814C25.5256 3.12558 24.8558 2.45581 24 2.45581C23.1442 2.45581 22.4744 3.12558 22.4744 3.9814V8.7814C22.4744 9.63721 23.1442 10.307 24 10.307C24.8558 10.307 25.5256 9.63721 25.5256 8.7814Z" />
        <path d="M22.4744 39.293V44.093C22.4744 44.9488 23.1442 45.6186 24 45.6186C24.8558 45.6186 25.5256 44.9488 25.5256 44.093V39.293C25.5256 38.4372 24.8558 37.7674 24 37.7674C23.1442 37.7674 22.4744 38.4372 22.4744 39.293Z" />
        <path d="M35.8698 14.3256L39.2558 10.9395C39.8512 10.3442 39.8512 9.37675 39.2558 8.7814C38.6605 8.18605 37.693 8.18605 37.0977 8.7814L33.7116 12.1674C33.1163 12.7628 33.1163 13.7302 33.7116 14.3256C34.0093 14.6233 34.3814 14.7721 34.7907 14.7721C35.2 14.7721 35.5721 14.6233 35.8698 14.3256V14.3256Z" />
        <path d="M8.74419 39.293C9.04186 39.5907 9.41396 39.7395 9.82326 39.7395C10.1954 39.7395 10.6047 39.5907 10.9023 39.293L14.2884 35.907C14.8837 35.3116 14.8837 34.3442 14.2884 33.7488C13.693 33.1535 12.7256 33.1535 12.1302 33.7488L8.74419 37.1349C8.14884 37.7302 8.14884 38.6977 8.74419 39.293Z" />
        <path d="M45.5814 24.0372C45.5814 23.1814 44.9116 22.5116 44.0558 22.5116H39.2558C38.4 22.5116 37.7302 23.1814 37.7302 24.0372C37.7302 24.893 38.4 25.5628 39.2558 25.5628H44.0558C44.8744 25.5628 45.5814 24.893 45.5814 24.0372Z" />
        <path d="M3.94419 25.5628H8.74419C9.6 25.5628 10.2698 24.893 10.2698 24.0372C10.2698 23.1814 9.6 22.5116 8.74419 22.5116H3.94419C3.08837 22.5116 2.41861 23.1814 2.41861 24.0372C2.41861 24.893 3.12558 25.5628 3.94419 25.5628Z" />
        <path d="M38.1767 39.7395C38.5488 39.7395 38.9581 39.5907 39.2558 39.293C39.8512 38.6977 39.8512 37.7302 39.2558 37.1349L35.8698 33.7488C35.2744 33.1535 34.307 33.1535 33.7116 33.7488C33.1163 34.3442 33.1163 35.3116 33.7116 35.907L37.0977 39.293C37.3953 39.5907 37.8046 39.7395 38.1767 39.7395V39.7395Z" />
        <path d="M14.2884 14.3256C14.8837 13.7302 14.8837 12.7628 14.2884 12.1674L10.9023 8.7814C10.307 8.18605 9.33954 8.18605 8.74419 8.7814C8.14884 9.37675 8.14884 10.3442 8.74419 10.9395L12.1302 14.3256C12.4279 14.6233 12.8 14.7721 13.2093 14.7721C13.6186 14.7721 13.9907 14.6233 14.2884 14.3256V14.3256Z" />
      </g>
    </svg>
  </Icon>
);

export interface ThemeSwitcherProps {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
}

export const ThemeSwitcher: FC<ThemeSwitcherProps> = observer(
  ({ theme, setTheme }) => {
    const handleChange = () => {
      setTheme(theme === "light" ? "dark" : "light");
    };

    return (
      <Button variant={"secondary"} onClick={handleChange}>
        {theme === "light" ? <Sun /> : <Moon />}
      </Button>
    );
  }
);
