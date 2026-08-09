/*
 * Copyright 2026 The Backstage Authors
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

/**
 * Width of each TechDocs sidebar (navigation and table of contents).
 * Wider than MkDocs Material's default (12.1rem) to match Backstage sidebar density.
 */
export const TECHDOCS_SIDEBAR_WIDTH = '16rem';

/**
 * Default max width of the TechDocs reader column (nav + content + TOC).
 * Matches MkDocs Material's `.md-grid { max-width: 61rem }` so the TOC stays
 * next to the article on wide viewports. Override with
 * `--techdocs-layout-max-width` on a light-DOM ancestor (inherits into shadow).
 */
export const TECHDOCS_LAYOUT_MAX_WIDTH = '61rem';
