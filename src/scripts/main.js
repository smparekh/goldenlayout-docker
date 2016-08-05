/**
* 2016-08-01
* sparekh:
* Removed static user list, replaced with data provided by API
* Replaced the use of name in key with id
*/

/***************************
* UserList Component
***************************/
var UserList = React.createClass({
	getInitialState: function() {
		return { users: [
        ]};
	},
	componentDidMount: function() {
		this.serverRequest = $.get('http://jsonplaceholder.typicode.com/users', function (result) {
			//var returnedUsers = result;
			this.setState({
				users: result
			});
		}.bind(this));
	},
	componentWillUnmount: function() {
		this.serverRequest.abort();
	},
	render: function() {
		var eventHub = this.props.glEventHub;
		return (
			<ul className="userlist">
				{this.state.users.map(function( user ){
					return <User
						key={user.id}
						userData={user}
						glEventHub={eventHub} />
				})}
			</ul>
		)
	}
});


/***************************
* User Component
***************************/
var User = React.createClass({
    getInitialState: function() {
        return this.props.userData;
    },
    selectUser: function() {
        this.props.glEventHub.emit( 'user-select', this.state );
    },
    render: function() {
        return (
            <li onClick={this.selectUser}>{this.state.name}</li>
        )
    }
});

/***************************
* UserDetail Component
***************************/
var UserDetail = React.createClass({
    componentWillMount: function() {
        this.props.glEventHub.on( 'user-select', this.setUser );
    },
    componentWillUnmount: function() {
        this.props.glEventHub.off( 'user-select', this.setUser );
    },
    setUser: function( userData ) {
        this.setState( userData );
    },
    render: function() {
        if( this.state ) {
            return (
                <div className="userdetails">
                    <h2>{this.state.name}</h2>
					<p>ID: {this.state.id}</p>
					<p>Username: {this.state.username}</p>
                    <p>Email: {this.state.email}</p>
					<p>Phone: {this.state.phone}</p>
					<p>Website: {this.state.website}</p>
                </div>
            )
        } else {
            return (<div className="userdetails">No user selected</div>)
        }
    }
});

/***************************
* Highcharts Init
***************************/
// var Chart = React.createClass({
// 	getInitialState: function() {
// 		return {
// 			age: [20, 30, 40, 50, 60],
// 			weight: [120,125,130,125,120]
// 		}
// 	},
// 	render: function() {
// 		return (
// 			<div id="chart">
// 				<h1>Age vs. Weight</h1>
// 				<HighChart age={this.state.age} weight={this.state.weight} />
// 			</div>
// 		)
// 	}
// });

var HighChart = React.createClass({
	getInitialState: function() {
		return {
			month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
			avgTemp: [30.7,31.5,39.0,49.8,60.8,70.2,75.6,73.8,66.9,55.9,44.8,34.5]
		}
	},
	componentWillMount: function() {
		this.props.glEventHub.on('resize', this.reflowChart);
		this.props.glEventHub.on('popout', this.reflowChart);
		this.props.glEventHub.on('show', this.redrawChart);
	},
	componentDidMount: function() {
		var months = this.state.month;
		var temps = this.state.avgTemp;
		$('.chart-container').highcharts({
			title: {
				text: 'Average Temperature in NYC Central Park'
			},
			subtitle: {
				text: '1821 - 1987, Yearly Avg: 52.7'
			},
			credits: {
				href: '',
				text: ''
			},
			xAxis: {
				title: {
					text: 'Months'
				},
				categories: months
			},
			yAxis: {
				title: {
					text: 'Temperature'
				}
			},
			plotOptions: {
				series: {
					dataLables: {
						enabled: true
					},
				}
			},
			chart: {
				events: {
					redraw: function() {
						var label = this.renderer.label('The chart was just redrawn', 100, 120)
						.attr({
							fill: Highcharts.getOptions().colors[0],
							padding: 10,
							r: 5,
							zIndex: 8
						})
						.css({
							color: '#FFFFFF'
						})
						.add();
						setTimeout(function() {
							label.fadeOut();
						}, 1000);
					}
				},
				backgroundColor: "#FFFFFF",
				type: "line"
			},
			series: [{
				name: "Temperature",
				data: temps
			}]
		});
	},
	redrawChart: function() {
		$('.chart-container', this).highcharts().redraw();
	},
	reflowChart: function() {
		$('.chart-container', this).highcharts().reflow();
	},
	componentWillUnmount: function() {
		this.props.glEventHub.off('show', this.redrawChart);
		this.props.glEventHub.off('resize', this.reflowChart);
		this.props.glEventHub.off('popout', this.reflowChart);
	},
	render: function() {
		var style = {
			marginTop: "25px",
			marginBottom: "0px"
		};
		return (
			<div style={style} className="chart-container">
			</div>
		)
	}
});

/***************************
* GoldenLayout Init
***************************/
var config = {
	settings: {
		showPopoutIcon: true
	},
	content: [{
		type: 'row',
		content: [{
			title: 'Users',
			type:'react-component',
			component: 'user-list'
		},{
			type: 'column',
			content:[{
				title: 'User Detail',
				type: 'react-component',
				component: 'user-detail'
			},{
				title: 'Chart',
				type: 'react-component',
				component: 'chart'
			}]
		}]
	}]
};

var myLayout = new GoldenLayout( config );
myLayout.registerComponent( 'user-list', UserList );
myLayout.registerComponent( 'user-detail', UserDetail );
myLayout.registerComponent( 'chart', HighChart);
myLayout.init();
