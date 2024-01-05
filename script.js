"use strict";
var UserStatus;
(function (UserStatus) {
    UserStatus["LoggedIn"] = "Logged In";
    UserStatus["LoggingIn"] = "Logging In";
    UserStatus["LoggedOut"] = "Logged Out";
    UserStatus["LogInError"] = "Log In Error";
    UserStatus["VerifyingLogIn"] = "Verifying Log In";
})(UserStatus || (UserStatus = {}));
var Default;
(function (Default) {
    Default["PIN"] = "3006";
})(Default || (Default = {}));
var WeatherType;
(function (WeatherType) {
    WeatherType["Cloudy"] = "Cloudy";
    WeatherType["Rainy"] = "Rainy";
    WeatherType["Stormy"] = "Stormy";
    WeatherType["Sunny"] = "Sunny";
})(WeatherType || (WeatherType = {}));
const defaultPosition = () => ({
    left: 0,
    x: 0
});
const N = {
    clamp: (min, value, max) => Math.min(Math.max(min, value), max),
    rand: (min, max) => Math.floor(Math.random() * (max - min + 1) + min)
};
const T = {
    format: (date) => {
        const hours = T.formatHours(date.getHours()), minutes = date.getMinutes(), seconds = date.getSeconds();
        return `${hours}:${T.formatSegment(minutes)}`;
    },
    formatHours: (hours) => {
        return hours % 12 === 0 ? 12 : hours % 12;
    },
    formatSegment: (segment) => {
        return segment < 10 ? `0${segment}` : segment;
    }
};
const LogInUtility = {
    verify: async (pin) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (pin === Default.PIN) {
                    resolve(true);
                }
                else {
                    reject(`Invalid pin: ${pin}`);
                }
            }, N.rand(300, 700));
        });
    }
};
const useCurrentDateEffect = () => {
    const [date, setDate] = React.useState(new Date());
    React.useEffect(() => {
        const interval = setInterval(() => {
            const update = new Date();
            if (update.getSeconds() !== date.getSeconds()) {
                setDate(update);
            }
        }, 100);
        return () => clearInterval(interval);
    }, [date]);
    return date;
};

const ScrollableComponent = (props) => {
    const ref = React.useRef(null);
    const [state, setStateTo] = React.useState({
        grabbing: false,
        position: defaultPosition()
    });
    const handleOnMouseDown = (e) => {
        setStateTo(Object.assign(Object.assign({}, state), { grabbing: true, position: {
                x: e.clientX,
                left: ref.current.scrollLeft
            } }));
    };
    const handleOnMouseMove = (e) => {
        if (state.grabbing) {
            const left = Math.max(0, state.position.left + (state.position.x - e.clientX));
            ref.current.scrollLeft = left;
        }
    };
    const handleOnMouseUp = () => {
        if (state.grabbing) {
            setStateTo(Object.assign(Object.assign({}, state), { grabbing: false }));
        }
    };
    return (React.createElement("div", { ref: ref, className: classNames("scrollable-component", props.className), id: props.id, onMouseDown: handleOnMouseDown, onMouseMove: handleOnMouseMove, onMouseUp: handleOnMouseUp, onMouseLeave: handleOnMouseUp }, props.children));
};

const WeatherSnap = () => {
    const [temperature] = React.useState(N.rand(65, 85));
    return (React.createElement("span", { className: "weather" },
        React.createElement("i", { className: "weather-type", className: "fa-duotone fa-sun" }),
        React.createElement("span", { className: "weather-temperature-value" }, temperature),
        React.createElement("span", { className: "weather-temperature-unit" }, "\u00B0F")));
};

const Reminder = () => {
    return (React.createElement("div", { className: "reminder" },
        React.createElement("div", { className: "reminder-icon" },
            React.createElement("i", { className: "fa-regular fa-bell" })),
        React.createElement("span", { className: "reminder-text" },
            "Extra cool people watching ",
            React.createElement("span", { className: "reminder-time" }, ""))));
};
const Time = () => {
  const date = null; // Keep the variable for consistency, but assign null

  return React.createElement("span", { className: "time" }, "Troffi"); // Directly render "Hello"
};
const Info = (props) => {
  return React.createElement(
    "div",
    { id: props.id, className: "info" },
    React.createElement("span", { className: "time" }, "Troffi"), // Use a span for consistency
    React.createElement("span", { className: "weather" }, "❤️") // Replace WeatherSnap with span
  );
};

const PinDigit = (props) => {
    const [hidden, setHiddenTo] = React.useState(false);
    React.useEffect(() => {
        if (props.value) {
            const timeout = setTimeout(() => {
                setHiddenTo(true);
            }, 500);
            return () => {
                setHiddenTo(false);
                clearTimeout(timeout);
            };
        }
    }, [props.value]);
    return (React.createElement("div", { className: classNames("app-pin-digit", { focused: props.focused, hidden }) },
        React.createElement("span", { className: "app-pin-digit-value" }, props.value || "")));
};
const Pin = () => {
    const { userStatus, setUserStatusTo } = React.useContext(AppContext);
    const [pin, setPinTo] = React.useState("");
    const ref = React.useRef(null);
    React.useEffect(() => {
        if (userStatus === UserStatus.LoggingIn || userStatus === UserStatus.LogInError) {
            ref.current.focus();
        }
        else {
            setPinTo("");
        }
    }, [userStatus]);
    React.useEffect(() => {
        if (pin.length === 4) {
            const verify = async () => {
                try {
                    setUserStatusTo(UserStatus.VerifyingLogIn);
                    if (await LogInUtility.verify(pin)) {
                        setUserStatusTo(UserStatus.LoggedIn);
                    }
                }
                catch (err) {
                    console.error(err);
                    setUserStatusTo(UserStatus.LogInError);
                }
            };
            verify();
        }
        if (userStatus === UserStatus.LogInError) {
            setUserStatusTo(UserStatus.LoggingIn);
        }
    }, [pin]);
    const handleOnClick = () => {
        ref.current.focus();
    };
    const handleOnCancel = () => {
        setUserStatusTo(UserStatus.LoggedOut);
    };
    const handleOnChange = (e) => {
        if (e.target.value.length <= 4) {
            setPinTo(e.target.value.toString());
        }
    };
    const getCancelText = () => {
        return (React.createElement("span", { id: "app-pin-cancel-text", onClick: handleOnCancel }, "Cancel"));
    };
    const getErrorText = () => {
        if (userStatus === UserStatus.LogInError) {
            return (React.createElement("span", { id: "app-pin-error-text" }, "Invalid"));
        }
    };
    return (React.createElement("div", { id: "app-pin-wrapper" },
        React.createElement("input", { disabled: userStatus !== UserStatus.LoggingIn && userStatus !== UserStatus.LogInError, id: "app-pin-hidden-input", maxLength: 4, ref: ref, type: "number", value: pin, onChange: handleOnChange }),
        React.createElement("div", { id: "app-pin", onClick: handleOnClick },
            React.createElement(PinDigit, { focused: pin.length === 0, value: pin[0] }),
            React.createElement(PinDigit, { focused: pin.length === 1, value: pin[1] }),
            React.createElement(PinDigit, { focused: pin.length === 2, value: pin[2] }),
            React.createElement(PinDigit, { focused: pin.length === 3, value: pin[3] })),
        React.createElement("h3", { id: "app-pin-label" },
            "Enter PIN",
            getErrorText(),
            " ",
            getCancelText())));
};

const MenuSection = (props) => {
    const getContent = () => {
        if (props.scrollable) {
            return (React.createElement(ScrollableComponent, { className: "menu-section-content" }, props.children));
        }
        return (React.createElement("div", { className: "menu-section-content" }, props.children));
    };
    return (React.createElement("div", { id: props.id, className: "menu-section" },
        React.createElement("div", { className: "menu-section-title" },
            React.createElement("i", { className: props.icon }),
            React.createElement("span", { className: "menu-section-title-text" }, props.title)),
        getContent()));
};
const QuickNav = () => {
  const getItems = null; // Assign null to the function

  return React.createElement(ScrollableComponent, { id: null }); // Assign null to the id prop
};


const Weather = () => {
  const getDays = null; // Assign null to the function

  return React.createElement(MenuSection, {
    icon: null,
    id: null,
    scrollable: null,
    title: null,
  }); // Assign null to props
};


const Tools = () => {
    const getTools = () => {
        return [
          {
            icon: "fa-solid fa-cloud-sun",
            id: 1,
            image:
              "https://images.unsplash.com/photo-1515041219749-89347f83291a?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            label: "",
            name: "KIDS",
          },
          {
            icon: "fa-solid fa-u",
            id: 2,
            image:
              "https://images.unsplash.com/photo-1569789010436-421d71a9fc38?q=80&w=2025&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            label: "",
            name: "U/A",
          },
          {
            icon: "fa-solid fa-piggy-bank",
            id: 3,
            image:
              "https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            label: "",
            name: "12+",
          },
          {
            icon: "fa-solid fa-plane",
            id: 4,
            image:
              "https://plus.unsplash.com/premium_photo-1661907048617-a55ab116bd26?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            label: "",
            name: "16+",
          },
          {
            icon: "fa-solid fa-gamepad-modern",
            id: 5,
            image:
              "https://images.unsplash.com/photo-1470259078422-826894b933aa?q=80&w=2074&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            label: "",
            name: "18+",
          },
          {
            icon: "fa-solid fa-video",
            id: 6,
            image:
              "https://images.unsplash.com/photo-1568065219398-8f9c0bde728d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            label: "",
            name: "R",
          },
        ].map((tool) => {
          const styles = {
            backgroundImage: `url(${tool.image})`,
          };
          return React.createElement(
            "div",
            { key: tool.id, className: "tool-card" },
            React.createElement("div", {
              className: "tool-card-background background-image",
              style: styles,
            }),
            React.createElement(
              "div",
              { className: "tool-card-content" },
              React.createElement(
                "div",
                { className: "tool-card-content-header" },
                React.createElement(
                  "span",
                  { className: "tool-card-label" },
                  tool.label
                ),
                React.createElement(
                  "span",
                  { className: "tool-card-name" },
                  tool.name
                )
              ),
              React.createElement("i", {
                className: classNames(tool.icon, "tool-card-icon"),
              })
            )
          );
        });
    };
    return (React.createElement(MenuSection, { icon: "fa-solid fa-toolbox", id: "tools-section", title: "AGE-RATING" }, getTools()));
};
const Restaurants = () => {
    const getRestaurants = () => {
        return [
          {
            desc: "Explosive sequences and intense stunts as heroes battle against formidable foes, delivering adrenaline-pumping excitement",
            id: 1,
            image:
              "https://images.unsplash.com/photo-1560354508-468e7201bbc2?q=80&w=2067&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            title: "Action",
          },
          {
            desc: "Heartwarming tales of love, navigating the intricacies of relationships and emotions in various settings",
            id: 2,
            image:
              "https://images.unsplash.com/photo-1496080940026-ce069e2759f5?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            title: "Romance",
          },
          {
            desc: "Hilarious situations and witty humor unfold, aiming to tickle your funny bone and leave you in stitches",
            id: 3,
            image:
              "https://images.unsplash.com/photo-1565945887714-d5139f4eb0ce?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            title: "Comedy",
          },
          {
            desc: "Futuristic worlds, advanced technology, and imaginative concepts exploring the possibilities of science and the unknown",
            id: 4,
            image:
              "https://images.unsplash.com/photo-1655393001768-d946c97d6fd1?q=80&w=1776&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            title: "SCI-FI",
          },
        ].map((restaurant) => {
          const styles = {
            backgroundImage: `url(${restaurant.image})`,
          };
          return React.createElement(
            "div",
            {
              key: restaurant.id,
              className: "restaurant-card background-image",
              style: styles,
            },
            React.createElement(
              "div",
              { className: "restaurant-card-content" },
              React.createElement(
                "div",
                { className: "restaurant-card-content-items" },
                React.createElement(
                  "span",
                  { className: "restaurant-card-title" },
                  restaurant.title
                ),
                React.createElement(
                  "span",
                  { className: "restaurant-card-desc" },
                  restaurant.desc
                )
              )
            )
          );
        });
    };
    return (React.createElement(MenuSection, { icon: "fa-regular fa-pot-food", id: "restaurants-section", title: "GENRES" }, getRestaurants()));
};
const Movies = () => {
    const getMovies = () => {
        return [
          {
            desc: "Cinematic rollercoasters of emotions – a visual feast for your senses",
            id: 1,
            icon: "fa-solid fa-popcorn",
            image:
              "https://images.unsplash.com/photo-1635805737707-575885ab0820?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            title: "Movies",
          },
          {
            desc: "Binge-worthy journeys that hook you in and keep you coming back for more",
            id: 2,
            icon: "fa-solid fa-face-smile",
            image:
              "https://images.unsplash.com/photo-1627895766710-7cf5c594f08e?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            title: "Series",
          },
          {
            desc: "Vibrant worlds overflowing with imagination, where anything is possible.",
            id: 3,
            icon: "fa-solid fa-bat",
            image:
              "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            title: "Anime",
          },
          {
            desc: "Love stories simmering with cultural flair, sprinkled with humor and drama",
            id: 4,
            icon: "fa-solid fa-head-side-heart",
            image:
              "https://plus.unsplash.com/premium_photo-1664478243376-e50c9138ef0d?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            title: "K-Drama",
          },
        ].map((movie) => {
          const styles = {
            backgroundImage: `url(${movie.image})`,
          };
          const id = `movie-card-${movie.id}`;
          return React.createElement(
            "div",
            { key: movie.id, id: id, className: "movie-card" },
            React.createElement("div", {
              className: "movie-card-background background-image",
              style: styles,
            }),
            React.createElement(
              "div",
              { className: "movie-card-content" },
              React.createElement(
                "div",
                { className: "movie-card-info" },
                React.createElement(
                  "span",
                  { className: "movie-card-title" },
                  movie.title
                ),
                React.createElement(
                  "span",
                  { className: "movie-card-desc" },
                  movie.desc
                )
              ),
              React.createElement("i", { className: movie.icon })
            )
          );
        });
    };
    return (React.createElement(MenuSection, { icon: "fa-solid fa-camera-movie", id: "movies-section", scrollable: true, title: "Popcorn time!" }, getMovies()));
};
const UserStatusButton = (props) => {
    const { userStatus, setUserStatusTo } = React.useContext(AppContext);
    const handleOnClick = () => {
        setUserStatusTo(props.userStatus);
    };
    return (React.createElement("button", { id: props.id, className: "user-status-button clear-button", disabled: userStatus === props.userStatus, type: "button", onClick: handleOnClick },
        React.createElement("i", { className: props.icon })));
};
const Menu = () => {
    return React.createElement(
      "div",
      { id: "app-menu" },
      React.createElement(
        "div",
        { id: "app-menu-content-wrapper" },
        React.createElement(
          "div",
          { id: "app-menu-content" },
          React.createElement(
            "div",
            { id: "app-menu-content-header" },
            React.createElement(
              "div",
              { className: "app-menu-content-header-section" },
              React.createElement(Info, { id: "app-menu-info" }),
              React.createElement(Reminder, null)
            ),
            React.createElement(
              "div",
              { className: "app-menu-content-header-section" },
              React.createElement(UserStatusButton, {
                icon: "fa-solid fa-arrow-right-from-arc",
                id: "sign-out-button",
                userStatus: UserStatus.LoggedOut,
              })
            )
          ),
          React.createElement(QuickNav, null),
          React.createElement(
            "a",
            {
              id: "youtube-link",
              className: "clear-button",
              href: "https://github.com/sharanshjha",
              target: "_blank",
            },
            React.createElement("i", { className: "fa-brands fa-github" }),
            React.createElement("span", null, "Sharansh Jha")
          ),
          React.createElement(Weather, null),
          React.createElement(Restaurants, null),
          React.createElement(Tools, null),
          React.createElement(Movies, null)
        )
      )
    );
};
const Background = () => {
    const { userStatus, setUserStatusTo } = React.useContext(AppContext);
    const handleOnClick = () => {
        if (userStatus === UserStatus.LoggedOut) {
            setUserStatusTo(UserStatus.LoggingIn);
        }
    };
    return (React.createElement("div", { id: "app-background", onClick: handleOnClick },
        React.createElement("div", { id: "app-background-image", className: "background-image" })));
};
const Loading = () => {
    return (React.createElement("div", { id: "app-loading-icon" },
        React.createElement("i", { className: "fa-solid fa-spinner-third" })));
};
const AppContext = React.createContext(null);
const App = () => {
    const [userStatus, setUserStatusTo] = React.useState(UserStatus.LoggedOut);
    const getStatusClass = () => {
        return userStatus.replace(/\s+/g, "-").toLowerCase();
    };
    return (React.createElement(AppContext.Provider, { value: { userStatus, setUserStatusTo } },
        React.createElement("div", { id: "app", className: getStatusClass() },
            React.createElement(Info, { id: "app-info" }),
            React.createElement(Pin, null),
            React.createElement(Menu, null),
            React.createElement(Background, null),
            React.createElement("div", { id: "sign-in-button-wrapper" },
                React.createElement(UserStatusButton, { icon: "fa-solid fa-arrow-right-to-arc", id: "sign-in-button", userStatus: UserStatus.LoggingIn })),
            React.createElement(Loading, null))));
};
ReactDOM.render(React.createElement(App, null), document.getElementById("root"));