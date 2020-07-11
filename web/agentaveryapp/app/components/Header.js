// var React = require('react');

var Header = React.createClass({

render: function() {
  // <script type="text/javascript">
  //   $( document ).ready(function() {
  //     $(".navbar li").removeClass('active');
  //     $(".navbar a[href='" + window.location.pathname + "']").parent().addClass('active');
  //   })
  // </script>
  return (
    <div>
    <nav className="navbar">
      <div className="">
        <div className="navbar-header">
          <div className=" visible-xs">
            <button type="button" className="navbar-toggle collapsed dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false" id="dropdownMenu1">
              <span className="sr-only">Toggle navigation</span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
            </button>
            <ul className="nav dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenu1">
              <li className="active"><a href="/">Home <span className="sr-only">(current)</span></a></li>
              <li><a href="/about">About us</a></li>
              <li><a href="#">News & tips</a></li>
              <li><a href="#">Join</a></li>
              <li><a href="/userapp#/login">Sign in</a></li>
              <li role="separator" className="divider"></li>
              <li><a className="" href="/agent-signup">Sign In</a></li>
            </ul>
          </div>
          <span className="navbar-brand avery-log visible-xs">Agent Avery</span>
        </div>
        <div className="collapse navbar-collapse">
          <ul className="nav navbar-nav">
            <li className="pull-left hidden-xs">
              <span className="navbar-brand avery-log">Agent Avery</span>
            </li>
            <li className="active"><a href="/">Home <span className="sr-only">(current)</span></a></li>
            <li><a href="/about">About us</a></li>
            <li><a href="#">News & tips</a></li>
            <li><a href="#">Join</a></li>
            <li><a href="/userapp#/login">Sign in</a></li>
            <li className="pull-right">
            <a className="primary-btn" href="/agent-signup">Sign In</a></li>
          </ul>
        </div>
      </div>
    </nav>
</div>
)}

})

module.exports = Header;
