/*
 * Copyright 2022 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  TECHDOCS_LAYOUT_MAX_WIDTH,
  TECHDOCS_SIDEBAR_WIDTH,
} from '../../../constants';
import { RuleOptions } from './types';

const APP_SIDEBAR_WIDTH_PINNED = '224px';
const APP_SIDEBAR_WIDTH_COLLAPSED = '72px';

/**
 * Layout overrides for MkDocs Material rendered inside the TechDocs shadow DOM.
 *
 * History / rationale
 * -------------------
 * MkDocs Material (see main*.css) keeps nav + article + TOC together with:
 *   .md-grid { max-width: 61rem; margin-inline: auto }
 *   .md-main__inner { display: flex }
 *   .md-sidebar { position: sticky; align-self: flex-start }
 *   .md-sidebar--secondary { order: 2 }
 *   .md-content { flex-grow: 1; min-width: 0 }
 *
 * TechDocs historically replaced that with viewport-fixed sidebars
 * (PR #5063, Mar 2021): `position: fixed` + `.md-sidebar--secondary { right }`
 * and later `.md-grid { max-width: 100% }`. Fixed positioning is relative to the
 * viewport (shadow roots are not containing blocks), so the TOC pinned to the
 * window edge while the article stayed left — especially visible on ultrawide
 * screens. JS still sets `top` / `height` so sidebars clear Backstage chrome
 * outside the shadow tree.
 *
 * Desktop layout below restores Material's sticky + centered flex column while
 * keeping the drawer behavior on smaller breakpoints and the JS chrome sync.
 * Adopters can opt back into full-bleed with:
 *   --techdocs-layout-max-width: 100%;
 */
export default ({ theme, sidebar }: RuleOptions) => `

/*==================  Layout  ==================*/

/* mkdocs material v9 compat */
.md-nav__title {
  color: var(--md-default-fg-color);
}

/*
 * Match Material's centered reader column so nav/content/TOC stay a cohesive
 * group on wide viewports. Override with --techdocs-layout-max-width.
 */
.md-grid {
  max-width: var(--techdocs-layout-max-width, ${TECHDOCS_LAYOUT_MAX_WIDTH});
  margin-left: auto;
  margin-right: auto;
}

.md-nav {
  font-size: calc(var(--md-typeset-font-size) * 0.9);
}
.md-nav__link:not(:has(svg)) {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.md-nav__link:has(svg) > .md-ellipsis {
  flex-grow: 1;
}
.md-nav__icon {
  height: 20px !important;
  width: 20px !important;
  margin-left:${theme.spacing(1)}px;
}
.md-nav__icon svg {
  margin: 0;
  width: 20px !important;
  height: 20px !important;
}
.md-nav__icon:after {
  width: 20px !important;
  height: 20px !important;
}
.md-status--updated::after {
  -webkit-mask-image: var(--md-status--updated);
  mask-image: var(--md-status--updated);
}

.md-nav__item--active > .md-nav__link, a.md-nav__link--active {
  text-decoration: underline;
  color: var(--md-typeset-a-color);
}
.md-nav__link--active > .md-status:after {
  background-color: var(--md-typeset-a-color);
}
.md-nav__link[href]:hover > .md-status:after {
  background-color: var(--md-accent-fg-color);
}

.md-main__inner {
  display: flex;
  margin-top: 0;
}

.md-sidebar {
  width: ${TECHDOCS_SIDEBAR_WIDTH};
  flex-shrink: 0;
  align-self: flex-start;
}
.md-sidebar .md-sidebar__scrollwrap {
  width: ${TECHDOCS_SIDEBAR_WIDTH};
  height: 100%;
}

@supports selector(::-webkit-scrollbar) {
  [dir=ltr] .md-sidebar__inner {
      padding-right: calc(100% - 15.1rem);
  }
}

.md-content {
  flex-grow: 1;
  min-width: 0;
  margin-bottom: 50px;
}

.md-content > .md-sidebar {
  left: ${TECHDOCS_SIDEBAR_WIDTH};
}

.md-footer {
  position: fixed;
  bottom: 0px;
  pointer-events: none;
}

.md-footer-nav__link, .md-footer__link {
  pointer-events: all;
}

.md-footer__title {
  background-color: unset;
}
.md-footer-nav__link, .md-footer__link {
  width: ${TECHDOCS_SIDEBAR_WIDTH};
}

.md-dialog {
  background-color: unset;
}

/* Desktop: Material-like sticky sidebars inside the centered flex grid */
@media screen and (min-width: 76.25em) {
  .md-sidebar {
    position: sticky;
    /* top is set in JS to clear Backstage headers / tabs */
    bottom: auto;
    /*
     * Same height:0 trick as MkDocs Material: keep sticky sidebars out of the
     * flex height calculation so the article defines page length. JS sizes
     * .md-sidebar__scrollwrap to the visible viewport instead.
     */
    height: 0;
    /* Less padding before the Previous / Next buttons */
    padding-bottom: 0 !important;
  }

  .md-sidebar--secondary {
    order: 2;
    right: auto;
  }
}

@media screen and (max-width: 76.1875em) {
  .md-nav {
    transition: none !important;
    background-color: var(--md-default-bg-color)
  }
  .md-nav--primary .md-nav__title {
    cursor: auto;
    color: var(--md-default-fg-color);
    font-weight: 700;
    white-space: normal;
    line-height: 1rem;
    height: auto;
    display: flex;
    flex-flow: column;
    row-gap: 1.6rem;
    padding: 1.2rem .8rem .8rem;
    background-color: var(--md-default-bg-color);
  }
  .md-nav--primary .md-nav__title~.md-nav__list {
    box-shadow: none;
  }
  .md-nav--primary .md-nav__title ~ .md-nav__list > :first-child {
    border-top: none;
  }
  .md-nav--primary .md-nav__title .md-nav__button {
    display: none;
  }
  .md-nav--primary .md-nav__title .md-nav__icon {
    color: var(--md-default-fg-color);
    position: static;
    height: auto;
    margin: 0 0 0 -0.2rem;
  }
  .md-nav--primary > .md-nav__title [for="none"] {
    padding-top: 0;
  }
  .md-nav--primary .md-nav__item {
    border-top: none;
  }
  .md-nav--primary :is(.md-nav__title,.md-nav__item) {
    font-size : var(--md-typeset-font-size);
  }
  .md-nav .md-source {
    display: none;
  }

  .md-sidebar {
    position: fixed;
    bottom: 75px;
    height: 100%;
  }
  .md-sidebar--primary {
    width: ${TECHDOCS_SIDEBAR_WIDTH} !important;
    z-index: 200;
    left: ${
      sidebar.isPinned
        ? `calc(-${TECHDOCS_SIDEBAR_WIDTH} + var(--techdocs-sidebar-closed-offset-pinned, ${APP_SIDEBAR_WIDTH_PINNED}))`
        : `calc(-${TECHDOCS_SIDEBAR_WIDTH} + var(--techdocs-sidebar-closed-offset-collapsed, ${APP_SIDEBAR_WIDTH_COLLAPSED}))`
    } !important;
  }
  .md-sidebar--secondary:not([hidden]) {
    display: none;
  }

  [data-md-toggle=drawer]:checked~.md-container .md-sidebar--primary {
    transform: translateX(var(--techdocs-sidebar-open-translate, ${TECHDOCS_SIDEBAR_WIDTH}));
  }

  .md-content {
    max-width: 100%;
    margin-left: 0;
  }

  .md-header__button {
    margin: 0.4rem 0;
    margin-left: 0.4rem;
    padding: 0;
  }

  .md-overlay {
    left: 0;
  }

  .md-footer {
    position: static;
    padding-left: 0;
  }
  .md-footer-nav__link {
    /* footer links begin to overlap at small sizes without setting width */
    width: 50%;
  }
}

@media screen and (max-width: 600px) {
  .md-sidebar--primary {
    left: -${TECHDOCS_SIDEBAR_WIDTH} !important;
    width: ${TECHDOCS_SIDEBAR_WIDTH};
  }
}


@media print {
  .md-sidebar,
  #toggle-sidebar {
    display: none;
  }

  .md-content {
    margin: 0;
    width: 100%;
    max-width: 100%;
  }
}
`;
