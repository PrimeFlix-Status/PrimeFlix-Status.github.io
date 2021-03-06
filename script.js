$(document).ready(function () {
	var config = {
		uptimerobot: {
			api_keys: [
				// PrimeFlix
				'm781533570-85f03587db01a2f1ff1e5b10',
				// Plex - PF
				'm781526369-f74aa9257bf8fbb775e8df67',
				// Plex - PF III-EU
				'm783172382-92ea11ea62f46dd4e51d22b3',
				// Plex - PF-US
				'm785923538-4317c5f9e67e02b4d2aa4fec',
				// Plex - PF-Music
				'm783761622-2f2e7f05a52324006025ed9f',
				// Emby - PF-EU
				'm783761627-fb58dab95f0f9d928b466cec',
				// Emby - PF-US
				'm785923541-bad7b33e8afaa88c4ae95b18',
				// TVshows
				'm781533572-374ab8c61a812f9256d53239',
				// TVshows 4K
				'm781533576-6acd49f72abcb77ae42f37bf',
				// Plexpy
				'm781533590-8d2c178324fc23ead6b8b8b7',
				// Movies
				'm781533573-c57b4737eb62e6024bd7d068',
				// Movies 4K
				'm781533575-098f6735f3c10a4ed4d5881a',
				// PrimeFlix Bot
				'm781533616-4cfd0bf675219ca9cc09af6d',
				// Plex Request
				'm781533591-403e6bcc0d7b54787653c212',
				// Docker UI
				'm781533594-a75b856790e3cbb4a00c8756'
			],
			logs: 1,
			response_times: 1,
			all_time_uptime_ratio: 1,
			custom_uptime_ratios: "1-7-14-30",
			response_times_average: 30,
			response_times_warning: 3000,
		},
		github: {
			org: 'PrimeFlix-Status',
			repo: 'PrimeFlix-Status.github.io'
		},
		theme: 'dark'
	};

	function setStyleSheet(url){
		 var stylesheet = document.getElementById("stylesheet");
		 stylesheet.setAttribute('href', url);
	}

	if (config.theme == 'light') {
		setStyleSheet('style-light.css');
	}

	const status_text = {
		'operational': 'operational',
		'investigating': 'investigating',
		'major outage': 'outage',
		'degraded performance': 'degraded',
		'test paused': 'paused',
	};

	const monitors = config.uptimerobot.api_keys;
	for (let i in monitors) {
		var api_key = monitors[i];
		$.post('https://api.uptimerobot.com/v2/getMonitors', {
			"api_key": api_key,
			"format": "json",
			"logs": config.uptimerobot.logs,
			"response_times": config.uptimerobot.response_times,
			"all_time_uptime_ratio": config.uptimerobot.all_time_uptime_ratio,
			"custom_uptime_ratios": config.uptimerobot.custom_uptime_ratios,
			"response_times_average": config.uptimerobot.response_times_average
		}, UptimeRobot, 'json');
	}

	function _uptimeRobotSetStatus(check) {
		check.class = check.status === 2 ? 'label-success' : 'label-danger';
		check.text = check.status === 2 ? 'Operational' : 'Major Outage';
		if (check.status !== 2 && !check.lasterrortime) {
			check.lasterrortime = Date.now();
		}
		if (check.status === 2 && Date.now() - (check.lasterrortime * 1000) <= 86400000) {
			check.class = 'label-danger';
			check.text = 'Major Outage';
		}
		if (check.status === 2 && Math.round(check.average_response_time) >= config.uptimerobot.response_times_warning) {
			check.class = 'label-warning';
			check.text = 'Degraded Performance';
		}
		if (check.status === 0) {
			check.class = 'label-paused';
			check.text = 'Test Paused';
		}
		return check;
	}

	function _uptimeRobotSetData(monitor) {
		const clean_name = monitor.friendly_name.replace(/[^0-9a-zA-Z ]/g, '').replace(/ /g, '');
		const uptime_ratio = monitor.custom_uptime_ratio.split('-');
		const uptimeForever = monitor.all_time_uptime_ratio;

			$('#services').append('<div class="list-group-item">' +
			'<span class="badge ' + monitor.class + '"><b>' + monitor.text + '</span>' +
			'<a href="#" class="list-group-item-heading" onclick="\$\(\'\#' + monitor.clean_name + '\').toggleClass(\'collapse\');">' + monitor.friendly_name + '</a>' +
			'<div id="' + monitor.clean_name + '" class="graph collapse">' +
			'<canvas id="' + monitor.clean_name + '_cvs" width="400" height="150"></canvas>' +
				'</div>' +
				'</div>');
	}

	function _uptimeRobotSetGraph(monitor) {
			$('#statistics tbody').append('<tr>' +
			'<td><b>' + monitor.friendly_name + '</b></td>' +
			'<td>' + monitor.uptime_ratio[0] + '%</td>' +
			'<td>' + monitor.uptime_ratio[1] + '%</td>' +
			'<td>' + monitor.uptime_ratio[2] + '%</td>' +
			'<td>' + monitor.uptime_ratio[3] + '%</td>' +
			'<td>' + monitor.uptime_ratio[4] + '%</td>' +
			'<td>' + monitor.average_response_time + '</td>' +
			'</tr>');

		const gph_data = {
			type: 'line',
			data: {
				labels: [],
				datasets: [{
					label: 'Response Time (ms)',
					lineTension: 0,
					borderColor: "rgb(255, 214, 51)",
					borderWidth: 3,
					pointStyle: 'circle',
					pointBorderWidth: 1,
					pointRadius: 5,
					pointHoverRadius: 7,
					pointHoverBackgroundColor: "rgba(255, 214, 51)",
				backgroundColor: "rgb(255, 214, 51,0.5)",
					data: [],
				}]
			},
			options: {
				legend: {
					labels: {
						fontColor: '#ddd'
					}
				},
				scales: {
					yAxes: [{
						ticks: {
							fontColor: '#ddd'
						},
						gridLines: {
							color: "rgb(112,112,112)"
						}
					}],
					xAxes: [{
						display: false,
						ticks: {
							display: false,
							scaleFontSize: 0
						},
						gridLines: {
							color: "rgb(112,112,112)"
						}
					}]
				}
			}
		};

		if (config.theme == 'light') {
			gph_data.options.scales.yAxes[0].ticks.fontColor = '';
			gph_data.options.legend.labels.fontColor = '';
			gph_data.data.datasets[0].backgroundColor = 'rgba(0,0,0,0.5)';
		}

		monitor.response_times.forEach(function (datapoint) {
				gph_data.data.labels.push(formatDate(new Date(datapoint.datetime * 1000), 'D d M Y H:i:s (T)'));
				gph_data.data.datasets[0].data.push(datapoint.value);
			});

			gph_data.data.labels = gph_data.data.labels.reverse();
			gph_data.data.datasets[0].data = gph_data.data.datasets[0].data.reverse();

		const gph_ctx = $('#' + monitor.clean_name + '_cvs');
		const gph = new Chart(gph_ctx, gph_data);
	}

	function UptimeRobot(data) {
		data.monitors = data.monitors.map(_uptimeRobotSetStatus);

		var status = data.monitors.reduce(function (status, check) {
			return check.status !== 2 ? 'danger' : 'operational';
		}, 'operational');

		if (!$('#panel').data('incident')) {
			$('#panel').attr('class', (status === 'operational' ? 'panel-success' : 'panel-warning') );
			$('#paneltitle').html(status === 'operational' ? 'All systems are currently operational.' : 'One or more systems are inoperative');
		}

		data.monitors.forEach(function (item) {
			item.clean_name = item.friendly_name.replace(/[^0-9a-zA-Z ]/g, '').replace(/ /g, '');
			item.uptime_ratio = item.custom_uptime_ratio.split('-');
			item.uptime_ratio.push(item.all_time_uptime_ratio);
			_uptimeRobotSetData(item);
			_uptimeRobotSetGraph(item);
		});
	};

	var get_today = new Date();
	get_today.setDate(get_today.getDate() - 30.5);
	var scope_date = get_today.toISOString();

	$.getJSON('https://api.github.com/repos/' + config.github.org + '/' + config.github.repo + '/issues?state=all&since=' + scope_date).done(GitHubEntry);

	var maintainIssues = [];
	var incidentIssues = [];

	function GitHubEntry(issues) {
		issues.forEach(function (issue) {
			if (issue.labels.length > 0) {
				issue.labels.forEach(function (label) {
					if (label.name == 'maintenance' && issue.state == 'open') maintainIssues.push(issue);
					else incidentIssues.push(issue);
				});
			}
		});
		_gitHubIncidents(incidentIssues);
		_gitHubMaintainance();
	}

	function _gitHubMaintainance() {
		if (maintainIssues.length > 0) {
			maintainIssues.forEach(function (issue) {
				$('#maintenance').append('<div class="list-group-item">' +
					'<h4 class="list-group-item-heading"><b>' + issue.title + '</b></h4>' +
					'<p class="list-group-item-text">' + issue.body + '</p>' +
					'</div>');
			});
		}
		else {
			$('#maintenance').append('<div class="list-group-item">' +
				'<h4 class="list-group-item-heading"></h4>' +
				'<p class="list-group-item-text">There is currently no planned maintenance</p>' +
				'</div>');
		}
	}

	function _gitHubIncidents(issues) {
		issues.forEach(function (issue) {
				var status = issue.labels.reduce(function (status, label) {
					if (/^status:/.test(label.name)) {
						return label.name.replace('status:', '');
					} else {
						return status;
					}
				}, 'operational');

				var systems = issue.labels.filter(function (label) {
					return /^system:/.test(label.name);
				}).map(function (label) {
					return label.name.replace('system:', '')
				});

				if (issue.state === 'open') {
					$('#panel').data('incident', 'true');
					$('#panel').attr('class', (status !== 'operational' ? 'panel-danger' : 'panel-warning') );
					$('#paneltitle').html('<a href="#incidents">' + issue.title + '</a>');
				}

				var html = '<article class="timeline-entry">\n';
				html += '<div class="timeline-entry-inner">\n';

				if (issue.state === 'closed') {
					html += '<div class="timeline-icon bg-success"><i class="entypo-feather"></i></div>';
				} else if (issue.state === 'open' && status === 'operational'){
					html += '<div class="timeline-icon bg-warn"><i class="entypo-feather"></i></div>';
				} else {
					html += '<div class="timeline-icon bg-secondary"><i class="entypo-feather"></i></div>';
				}

				html += '<div class="timeline-label">\n';
			html += '<span class="date">' + formatDate(new Date(issue.created_at), 'D d M Y H:i:s (T)') + '</span>\n';

				if (issue.state === 'closed') {
					html += '<span class="badge label-success pull-right">closed</span>';
				} else {
					html += '<span class="badge ' + (status !== 'operational' ? 'label-danger' : 'label-warning') + ' pull-right">open</span>\n';
				}

				for (var i = 0; i < systems.length; i++) {
					html += '<span class="badge system pull-right">' + systems[i] + '</span>';
				}

				html += '<h2>' + issue.title + '</h2>\n';
				html += '<hr>\n';
				html += '<p>' + issue.body + '</p>\n';

				if (issue.state === 'open' && issue.created_at !== issue.updated_at) {
					html += '<p><em>Last update ' + formatDate(new Date(issue.updated_at), 'D d M Y H:i:s (T)') + '</p>'
				}

				if (issue.state === 'closed') {
					html += '<p><em>Updated ' + formatDate(new Date(issue.closed_at), 'D d M Y H:i:s (T)') + '<br/>';
					html += 'The system is back in normal operation.</p>';
				}
				html += '</div>';
				html += '</div>';
				html += '</article>';
				$('#incidents').append(html);
		});
	};

	function formatDate(x, y) {
		var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		var fullMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
		var days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
		var fullDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
		var suffix = ['st', 'nd', 'rd', 'th'];
		var z = {
			a: (x.getHours() >= 12) ? 'pm' : 'am',
			A: (x.getHours() >= 12) ? 'PM' : 'AM',
			B: Math.floor((((x.getUTCHours() + 1) % 24) + x.getUTCMinutes() / 60 + x.getUTCSeconds() / 3600) * 1000 / 24),
			c: x.toISOString(),
			m: (x.getHours().toString().length == 2) ? x.getMonth() + 1 : '0' + x.getMonth() + 1,
			M: months[x.getMonth()],
			n: x.getMonth() + 1,
			L: parseInt(((x.getFullYear() % 4 == 0) && (x.getFullYear() % 100 != 0)) || (x.getFullYear() % 400 == 0)),
			F: fullMonths[x.getMonth()],
			d: (x.getDate().toString().length == 2) ? x.getDate() : '0' + x.getDate(),
			j: x.getDate(),
			D: days[x.getDay()],
			l: fullDays[x.getDay()],
			N: x.getDay() + 1,
			w: x.getDay(),
			h: (x.getHours().toString().length == 2) ? ((x.getHours() + 11) % 12 + 1) : '0' + ((x.getHours() + 11) % 12 + 1),
			H: (x.getHours().toString().length == 2) ? x.getHours() : '0' + x.getHours(),
			G: x.getHours(),
			g: ((x.getHours() + 11) % 12 + 1),
			O: x.toString().match(/([-\+][0-9]+)\s/)[1],
			i: (x.getMinutes().toString().length == 2) ? x.getMinutes() : '0' + x.getMinutes(),
			s: (x.getSeconds().toString().length == 2) ? x.getSeconds() : '0' + x.getSeconds(),
			T: x.toString().replace(/.*[(](.*)[)].*/, '$1'),
			e: x.toString().replace(/.*[(](.*)[)].*/, '$1'),
			Y: x.getFullYear(),
			y: x.getYear(),
			u: 000000,
			v: 000000,
			z: Math.round((new Date().setHours(23) - new Date(x.getYear() + 1900, 0, 1, 0, 0, 0)) / 1000 / 60 / 60 / 24) - 1,
			U: Math.round(x.getTime() / 1000),
		};
		y = y.replace(/(a+|A+|B+|c+|m+|M+|n+|L+|F+|d+|D+|j+|l+|n+|N+|w+|g+|G+|O+|e+|u+|v+|z+|U+|h+|H+|i+|s+|T+|Y+|y+)/g, function (v) {
			var t = eval('z.' + v.slice(-1));
			return t;
		});

		return y.replace(/(y+)/g, function (v) {
			return x.getFullYear().toString().slice(-v.length)
		});
	};
});
