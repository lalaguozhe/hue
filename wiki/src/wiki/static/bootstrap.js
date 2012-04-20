// Licensed to Cloudera, Inc. under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  Cloudera, Inc. licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
Hue.Desktop.register({
	Wiki : {
		name : 'Wiki',
		//autolaunch: "/wiki/",
		css : '/wiki/static/css/wiki.css',
		require: [ 'wiki/Wiki' ],
		launch: function(path, options){
			// application launch code here 
			// example code below: 
			return new Wiki(path || '/wiki/', options);
		},
		menu: {
			id: 'hue-wiki-menu',
			img: {
				// Replace this with a real icon!
				// ideally a 55x55 transparent png
				src: '/wiki/static/art/wiki.png'
			}
		},
		help: '/help/wiki/'
	}
});
