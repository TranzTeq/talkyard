/* Makes thread columns horizontally resizable, in 2d layout.
 * Copyright (C) 2010-2012 Kaj Magnus Lindberg (born 1979)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */


var d = { i: debiki.internal, u: debiki.v0.util };
var $ = d.i.$;


d.i.makeColumnsResizable = function() {
  // Skip the title
  var $threads = $('.dw-depth-0 .dw-t');

  // Make replies to the root thread resizable horizontally. (Takes
  // perhaps 100 ms on my 6 core 2.8 GHz AMD, 24 depth-1 reply columns.)
  // (But skip inline replies; they expand eastwards regardless.)
  // $makeThreadEastResizable must be called before $makePostResizable (not in
  // use though!), or $makeThreadEastResizable has no effect. No idea
  // why -- my guess is some jQuery code does something similar to
  // `$.find(..)', and finds the wrong resizable stuff,
  // if the *inner* tag is made resizable before the *outer* tag.
  //
  // For touch devises, don't enable resizing of posts: it doesn't
  // work, and the resize handles steal touch events from buttons nearby.
  $threads.filter(function() {
    var $i = $(this);
    return !$i.is('.dw-i-t') && $i.parent().closest('.dw-t').is('.dw-hz');
  }).each($makeThreadEastResizable);
};


// Makes [threads layed out vertically] horizontally resizable.
function $makeThreadEastResizable() {
  $(this).resizable({
    direction: ['right']
  });
};


// vim: fdm=marker et ts=2 sw=2 tw=80 fo=tcqwn list
