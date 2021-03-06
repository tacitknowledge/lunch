import React, { Component, PropTypes } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import TooltipUserContainer from '../../containers/TooltipUserContainer';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './RestaurantVoteCount.scss';

export class _RestaurantVoteCount extends Component {
  static propTypes = {
    id: PropTypes.number.isRequired,
    votes: PropTypes.array.isRequired,
    user: PropTypes.object.isRequired
  };

  componentDidUpdate() {
    this._el.classList.add(s.updated);
    this.timeout = setTimeout(() => this._el.classList.remove(s.updated), 100);
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
  }

  render() {
    let voteCountContainer = null;
    if (this.props.votes.length > 0) {
      const voteCount = (
        <span>
          <strong>{this.props.votes.length}</strong>
          {this.props.votes.length === 1 ? ' vote' : ' votes'}
        </span>
      );

      let tooltip;
      if (this.props.user.id === undefined) {
        voteCountContainer = voteCount;
      } else {
        tooltip = (
          <Tooltip id={`voteCountTooltip_${this.props.id}`}>{this.props.votes.map(voteId =>
            <TooltipUserContainer key={`voteCountTooltipUser_${voteId}`} voteId={voteId} />
          )}</Tooltip>
        );
        voteCountContainer = (
          <OverlayTrigger placement="top" overlay={tooltip}>
            {voteCount}
          </OverlayTrigger>
        );
      }
    }

    return (
      <span ref={e => { this._el = e; }} className={s.root}>
        {voteCountContainer}
      </span>
    );
  }
}

export default withStyles(s)(_RestaurantVoteCount);
