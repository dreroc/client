// @flow
import * as Types from '../../../constants/types/teams'
import {amIBeingFollowed, amIFollowing} from '../../../constants/selectors'
import * as I from 'immutable'
import {connect} from 'react-redux'
import {compose} from 'recompose'
import {HeaderHoc} from '../../../common-adapters'
import {createShowUserProfile} from '../../../actions/profile-gen'
import {createGetProfile} from '../../../actions/tracker-gen'
import {createStartConversation} from '../../../actions/chat-gen'
import {isMobile} from '../../../constants/platform'
import {TeamMember} from '.'
import {type TypedState} from '../../../constants/reducer'
import {getCanPerform} from '../../../constants/teams'
import * as RPCTypes from '../../../constants/types/rpc-gen'

type StateProps = {
  teamname: string,
  following: boolean,
  follower: boolean,
  _you: ?string,
  _username: string,
  _memberInfo: I.Set<Types.MemberInfo>,
  yourOperations: RPCTypes.TeamOperation,
  loading: boolean,
}

const mapStateToProps = (state: TypedState, {routeProps}): StateProps => {
  const username = routeProps.get('username')
  const teamname = routeProps.get('teamname')

  return {
    teamname: teamname,
    loading: state.entities.getIn(['teams', 'teamNameToLoading', teamname], true),
    following: amIFollowing(state, username),
    follower: amIBeingFollowed(state, username),
    yourOperations: getCanPerform(state, teamname),
    _username: username,
    _you: state.config.username,
    _memberInfo: state.entities.getIn(['teams', 'teamNameToMembers', teamname], I.Set()),
  }
}

type DispatchProps = {
  onOpenProfile: () => void,
  _onEditMembership: (name: string, username: string) => void,
  _onRemoveMember: (name: string, username: string) => void,
  _onLeaveTeam: (teamname: string) => void,
  _onChat: (string, ?string) => void,
  onBack: () => void,
  // TODO remove member
}

const mapDispatchToProps = (dispatch: Dispatch, {routeProps, navigateAppend, navigateUp}): DispatchProps => ({
  onOpenProfile: () => {
    isMobile
      ? dispatch(createShowUserProfile({username: routeProps.get('username')}))
      : dispatch(
          createGetProfile({username: routeProps.get('username'), ignoreCache: true, forceDisplay: true})
        )
  },
  _onEditMembership: (name: string, username: string) =>
    dispatch(
      navigateAppend([
        {
          props: {teamname: name, username},
          selected: 'rolePicker',
        },
      ])
    ),
  _onRemoveMember: (teamname: string, username: string) => {
    dispatch(navigateAppend([{props: {teamname, username}, selected: 'reallyRemoveMember'}]))
  },
  _onLeaveTeam: (teamname: string) => {
    dispatch(navigateAppend([{props: {teamname}, selected: 'reallyLeaveTeam'}]))
  },
  _onChat: (username, myUsername) => {
    username && myUsername && dispatch(createStartConversation({users: [username, myUsername]}))
  },
  onBack: () => dispatch(navigateUp()),
})

const mergeProps = (stateProps: StateProps, dispatchProps: DispatchProps) => {
  // Gather contextual team membership info
  const yourInfo = stateProps._memberInfo.find(member => member.username === stateProps._you)
  const userInfo = stateProps._memberInfo.find(member => member.username === stateProps._username)
  const you = {
    username: stateProps._you,
    type: yourInfo && yourInfo.type,
  }
  const user = {
    username: stateProps._username,
    type: userInfo && userInfo.type,
  }
  // If they're an owner, you need to be an owner to edit them
  // otherwise you just need to be an admin
  let admin = user.type === 'owner' ? you.type === 'owner' : you.type === 'owner' || you.type === 'admin'
  if (stateProps.teamname.includes('.')) {
    admin = admin || stateProps.yourOperations.manageMembers
  }
  return {
    ...stateProps,
    ...dispatchProps,
    admin,
    user,
    you,
    onChat: () => dispatchProps._onChat(stateProps._username, stateProps._you),
    onEditMembership: () => dispatchProps._onEditMembership(stateProps.teamname, stateProps._username),
    onRemoveMember: () => {
      if (stateProps._username === stateProps._you) {
        dispatchProps._onLeaveTeam(stateProps.teamname)
      } else {
        dispatchProps._onRemoveMember(stateProps.teamname, stateProps._username)
      }
    },
  }
}

// $FlowIssue doesn't like HeaderHoc
export default compose(connect(mapStateToProps, mapDispatchToProps, mergeProps), HeaderHoc)(TeamMember)
