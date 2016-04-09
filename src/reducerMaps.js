import ActionTypes from './constants/ActionTypes';
import uuid from 'node-uuid';

const isFetching = state =>
  Object.assign({}, state, {
    isFetching: true
  });

export const restaurants = {
  [ActionTypes.SORT_RESTAURANTS](state) {
    return Object.assign({}, state, {
      items: state.items.map((item, index) => {
        item.sortIndex = index;
        return item;
      }).sort((a, b) => {
        // stable sort
        if (a.votes.length !== b.votes.length) { return b.votes.length - a.votes.length; }
        return a.sortIndex - b.sortIndex;
      })
    });
  },
  [ActionTypes.INVALIDATE_RESTAURANTS](state) {
    return Object.assign({}, state, {
      didInvalidate: true
    });
  },
  [ActionTypes.REQUEST_RESTAURANTS](state) {
    return Object.assign({}, state, {
      isFetching: true,
      didInvalidate: false
    });
  },
  [ActionTypes.RECEIVE_RESTAURANTS](state, action) {
    return Object.assign({}, state, {
      isFetching: false,
      didInvalidate: false,
      items: action.items
    });
  },
  [ActionTypes.POST_RESTAURANT]: isFetching,
  [ActionTypes.RESTAURANT_POSTED](state, action) {
    return Object.assign({}, state, {
      isFetching: false,
      items: [
        action.restaurant,
        ...state.items
      ]
    });
  },
  [ActionTypes.DELETE_RESTAURANT]: isFetching,
  [ActionTypes.RESTAURANT_DELETED](state, action) {
    return Object.assign({}, state, {
      isFetching: false,
      items: state.items.filter(item => item.id !== action.id)
    });
  },
  [ActionTypes.PATCH_RESTAURANT]: isFetching,
  [ActionTypes.RESTAURANT_PATCHED](state, action) {
    return Object.assign({}, state, {
      isFetching: false,
      items: state.items.map(item => {
        if (item.id === action.id) {
          return Object.assign({}, item, action.fields);
        }
        return item;
      })
    });
  },
  [ActionTypes.POST_VOTE]: isFetching,
  [ActionTypes.VOTE_POSTED](state, action) {
    return Object.assign({}, state, {
      isFetching: false,
      items: state.items.map(item => {
        if (item.id === action.vote.restaurant_id) {
          return Object.assign({}, item, {
            votes: [
              ...item.votes,
              action.vote
            ]
          });
        }
        return item;
      })
    });
  },
  [ActionTypes.DELETE_VOTE]: isFetching,
  [ActionTypes.VOTE_DELETED](state, action) {
    return Object.assign({}, state, {
      isFetching: false,
      items: state.items.map(item => {
        if (item.id === action.restaurantId) {
          return Object.assign({}, item, {
            votes: item.votes.filter(
              vote => vote.id !== action.id
            )
          });
        }
        return item;
      })
    });
  },
  [ActionTypes.POST_NEW_TAG_TO_RESTAURANT]: isFetching,
  [ActionTypes.POSTED_NEW_TAG_TO_RESTAURANT](state, action) {
    return Object.assign({}, state, {
      isFetching: false,
      items: state.items.map(item => {
        if (item.id === action.restaurantId) {
          return Object.assign({}, item, {
            tags: [
              ...item.tags,
              action.tag.id
            ]
          });
        }
        return item;
      })
    });
  },
  [ActionTypes.POST_TAG_TO_RESTAURANT]: isFetching,
  [ActionTypes.POSTED_TAG_TO_RESTAURANT](state, action) {
    return Object.assign({}, state, {
      isFetching: false,
      items: state.items.map(item => {
        if (item.id === action.restaurantId) {
          return Object.assign({}, item, {
            tags: [
              ...item.tags,
              action.id
            ]
          });
        }
        return item;
      })
    });
  },
  [ActionTypes.DELETE_TAG_FROM_RESTAURANT]: isFetching,
  [ActionTypes.DELETED_TAG_FROM_RESTAURANT](state, action) {
    return Object.assign({}, state, {
      isFetching: false,
      items: state.items.map(item => {
        if (item.id === action.restaurantId) {
          return Object.assign({}, item, {
            tags: item.tags.filter(
              tag => tag !== action.id
            )
          });
        }
        return item;
      })
    });
  },
};

export const flashes = {
  [ActionTypes.FLASH_ERROR](state, action) {
    return [
      ...state,
      {
        message: action.message,
        type: 'error'
      }
    ];
  },
  [ActionTypes.EXPIRE_FLASH](state, action) {
    const newState = Array.from(state);
    newState.splice(action.id, 1);
    return newState;
  }
};

export const notifications = {
  [ActionTypes.NOTIFY](state, action) {
    const { realAction } = action;
    const notification = {
      id: uuid.v1(),
      actionType: realAction.type
    };
    switch (notification.actionType) {
      case ActionTypes.VOTE_POSTED: {
        const { user_id, restaurant_id } = realAction.vote;
        notification.vals = {
          userId: user_id,
          restaurantId: restaurant_id
        };
        break;
      }
      case ActionTypes.VOTE_DELETED: {
        const { userId, restaurantId } = realAction;
        notification.vals = {
          userId,
          restaurantId
        };
        break;
      }
      default: {
        return state;
      }
    }
    return [
      ...state.slice(-3),
      notification
    ];
  },
  [ActionTypes.EXPIRE_NOTIFICATION](state, action) {
    return state.filter(n => n.id !== action.id);
  }
};

const resetRestaurant = (state, action) =>
  Object.assign({}, state, {
    [action.id]: undefined
  });

const resetAllRestaurants = () => ({});

const resetAddTagAutosuggestValue = (state, action) =>
  Object.assign({}, state, {
    [action.restaurantId]: Object.assign({}, state[action.restaurantId], { addTagAutosuggestValue: '' })
  });

export const listUi = {
  [ActionTypes.RECEIVE_RESTAURANTS]: resetAllRestaurants,
  [ActionTypes.RESTAURANT_PATCHED]: resetRestaurant,
  [ActionTypes.RESTAURANT_POSTED]: resetRestaurant,
  [ActionTypes.RESTAURANT_DELETED]: resetRestaurant,
  [ActionTypes.POSTED_TAG_TO_RESTAURANT]: resetAddTagAutosuggestValue,
  [ActionTypes.POSTED_NEW_TAG_TO_RESTAURANT]: resetAddTagAutosuggestValue,
  [ActionTypes.SET_ADD_TAG_AUTOSUGGEST_VALUE](state, action) {
    return Object.assign({}, state, {
      [action.id]: Object.assign({}, state[action.id], { addTagAutosuggestValue: action.value })
    });
  },
  [ActionTypes.SHOW_ADD_TAG_FORM](state, action) {
    return Object.assign({}, state, {
      [action.id]: Object.assign({}, state[action.id], { isAddingTags: true })
    });
  },
  [ActionTypes.HIDE_ADD_TAG_FORM](state, action) {
    return Object.assign({}, state, {
      [action.id]: Object.assign({}, state[action.id], { isAddingTags: false })
    });
  },
  [ActionTypes.SET_EDIT_NAME_FORM_VALUE](state, action) {
    return Object.assign({}, state, {
      [action.id]: Object.assign({}, state[action.id], { editNameFormValue: action.value })
    });
  },
  [ActionTypes.SHOW_EDIT_NAME_FORM](state, action) {
    return Object.assign({}, state, {
      [action.id]: Object.assign({}, state[action.id], { isEditingName: true })
    });
  },
  [ActionTypes.HIDE_EDIT_NAME_FORM](state, action) {
    return Object.assign({}, state, {
      [action.id]: Object.assign({}, state[action.id], { isEditingName: false })
    });
  }
};

export const mapUi = {
  [ActionTypes.RECEIVE_RESTAURANTS]: resetAllRestaurants,
  [ActionTypes.RESTAURANT_POSTED]: resetRestaurant,
  [ActionTypes.RESTAURANT_DELETED]: resetRestaurant,
  [ActionTypes.SHOW_INFO_WINDOW](state, action) {
    return Object.assign({}, state, {
      markers: Object.assign({}, state.markers, {
        [action.id]: Object.assign({}, state[action.id], { showInfoWindow: true })
      })
    });
  },
  [ActionTypes.HIDE_INFO_WINDOW](state, action) {
    return Object.assign({}, state, {
      markers: Object.assign({}, state.markers, {
        [action.id]: Object.assign({}, state[action.id], { showInfoWindow: false })
      })
    });
  },
  [ActionTypes.SET_SHOW_UNVOTED](state, action) {
    return Object.assign({}, state, {
      showUnvoted: action.val
    });
  }
};

export const pageUi = {
  [ActionTypes.SCROLL_TO_TOP](state) {
    return Object.assign({}, state, {
      shouldScrollToTop: true
    });
  },
  [ActionTypes.SCROLLED_TO_TOP](state) {
    return Object.assign({}, state, {
      shouldScrollToTop: false
    });
  },
};

export const modals = {
  [ActionTypes.SHOW_MODAL](state, action) {
    return Object.assign({}, state, {
      [action.name]: Object.assign({}, state[action.name], {
        shown: true,
        ...action.opts
      })
    });
  },
  [ActionTypes.HIDE_MODAL](state, action) {
    return Object.assign({}, state, {
      [action.name]: Object.assign({}, state[action.name], { shown: false })
    });
  },
  [ActionTypes.RESTAURANT_DELETED](state) {
    return Object.assign({}, state, {
      deleteRestaurant: Object.assign({}, state.deleteRestaurant, { shown: false })
    });
  },
  [ActionTypes.TAG_DELETED](state) {
    return Object.assign({}, state, {
      deleteTag: Object.assign({}, state.deleteTag, { shown: false })
    });
  }
};

export const tags = {
  [ActionTypes.POSTED_NEW_TAG_TO_RESTAURANT](state, action) {
    return Object.assign({}, state, {
      items: [
        ...state.items,
        action.tag
      ]
    });
  },
  [ActionTypes.DELETE_TAG]: isFetching,
  [ActionTypes.TAG_DELETED](state, action) {
    return Object.assign({}, state, {
      isFetching: false,
      items: state.items.filter(item => item.id !== action.id)
    });
  }
};

export const tagUi = {
  [ActionTypes.SHOW_TAG_FILTER_FORM](state) {
    return Object.assign({}, state, {
      filterFormShown: true
    });
  },
  [ActionTypes.HIDE_TAG_FILTER_FORM](state) {
    return Object.assign({}, state, {
      autosuggestValue: '',
      filterFormShown: false
    });
  },
  [ActionTypes.SET_TAG_FILTER_AUTOSUGGEST_VALUE](state, action) {
    return Object.assign({}, state, {
      autosuggestValue: action.value
    });
  },
  [ActionTypes.ADD_TAG_FILTER](state) {
    return Object.assign({}, state, {
      autosuggestValue: ''
    });
  }
};

export const tagFilters = {
  [ActionTypes.ADD_TAG_FILTER](state, action) {
    return [
      ...state,
      action.id
    ];
  },
  [ActionTypes.REMOVE_TAG_FILTER](state, action) {
    return state.filter(tagFilter => tagFilter !== action.id);
  },
  [ActionTypes.HIDE_TAG_FILTER_FORM]() {
    return [];
  }
};

export const latLng = {};
export const user = {};
export const users = {};
export const wsPort = {};
