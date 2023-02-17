// Special thanks to Lyfhael

const utils = require('./_utils')
let default_settings = require('./configs/HuTao_config.json')
let previous_page;
let ranked_observer;
let patcher_go_to_default_home_page = true;
let force_bg_pause = default_settings["default_animated"];
let force_audio_pause = default_settings["default_sound_autoplay"];
let wallpapers = default_settings["wallpaper_list"];


function apply_default_background() {
	let default_wallpaper = default_settings["default_wallpaper"]
	let index = wallpapers.indexOf(default_wallpaper);
	if (index !== -1) {
		wallpapers.splice(index, 1);
		wallpapers.unshift(default_wallpaper);
	}
}
apply_default_background()


function removeIframe() {
	const observer = new MutationObserver(mutations => {
		mutations.forEach(mutation => {
			if (mutation.type === 'childList') {
				mutation.addedNodes.forEach(node => {
					if (node.tagName === 'IFRAME' && node.hasAttribute('src') && node.hasAttribute('referrerpolicy')) {
						//node.remove();
						;
					}
				});
			}
		});
	});
	observer.observe(document.body, { childList: true, subtree: true });
}


var nodeRemovedEvent = function (event) {
	if (event.target.classList && event.target.classList.contains("lol-loading-screen-container")) {
		let hutaoBg = document.getElementById("hutao-bg");
		let viewportRoot = document.getElementById("rcp-fe-viewport-root")

		viewportRoot.style.filter = "none"
		hutaoBg.style.filter = "brightness(0.7) saturate(0.8)"
		document.removeEventListener("DOMNodeRemoved", nodeRemovedEvent);
		// monitorPage()
	}
};

document.addEventListener("DOMNodeRemoved", nodeRemovedEvent);
let updateLobbyRegaliaBanner = async message => {
	let phase = JSON.parse(message["data"])[2]["data"];
	if (phase == "Lobby") {
		let intervalId = window.setInterval(() => {
			try {
				let base = document.querySelector("lol-regalia-parties-v2-element.regalia-loaded").shadowRoot.querySelector(".regalia-parties-v2-banner-backdrop.regalia-banner-loaded")

				base.shadowRoot.querySelector(".regalia-banner-asset-static-image").style.filter = "sepia(1) brightness(3.5) opacity(0.4)"
				base.shadowRoot.querySelector(".regalia-banner-state-machine").shadowRoot.querySelector(".regalia-banner-intro.regalia-banner-video").style.filter = "grayscale(1) saturate(0) brightness(0.5)"

			} catch {
				return;
			}
			window.clearInterval(intervalId)
		}, 100)
	}
}


function hutao_play_pause() {
	let hutao_bg_elem = document.getElementById("hutao-bg")

	if (force_bg_pause) {
		hutao_bg_elem.pause()
	}
	else {
		hutao_bg_elem.play()
	}
}

function audio_play_pause() {
	let audio = document.getElementById("bg-audio")

	if (!force_audio_pause) {
		audio.pause()
	}
	else {
		audio.play()
	}
}

function play_pause_set_icon(elem) {
	let pause_bg_icon = elem || document.querySelector(".pause-bg-icon")

	if (!pause_bg_icon) {
		return;
	}
	if (!force_bg_pause) {
		pause_bg_icon.setAttribute("src", "//assets/HuTao/Icon/pause_button.png")
	}
	else {
		pause_bg_icon.setAttribute("src", "//assets/HuTao/Icon/play_button.png")
	}

}

function play_pause_set_icon_audio(elem) {
	let pause_audio_icon = elem || document.querySelector(".pause-audio-icon")

	if (!pause_audio_icon) {
		return;
	}
	if (!force_audio_pause) {
		pause_audio_icon.setAttribute("src", "//assets/HuTao/Icon/audio.png")
	}
	else {
		pause_audio_icon.setAttribute("src", "//assets/HuTao/Icon/mute.png")
	}

}

function next_wallpaper() {
	let hutaoBg = document.getElementById("hutao-bg")
	document.querySelector(":root").classList.remove(wallpapers[0].replace(/\.[a-zA-Z]+$/, '-vars'))
	hutaoBg.classList.add("webm-hidden");
	wallpapers.push(wallpapers.shift())
	document.querySelector(":root").classList.add(wallpapers[0].replace(/\.[a-zA-Z]+$/, '-vars'))
	setTimeout(function () {
		hutaoBg.src = `//assets/HuTao/Backgrounds/${wallpapers[0]}`
		hutao_play_pause()
		hutaoBg.classList.remove("webm-hidden");
	}, 500);
}


function create_webm_buttons() {
	const container = document.createElement("div")

	const pauseBg = document.createElement("div");
	const pauseAudio = document.createElement("div");
	const nextBg = document.createElement("div");

	const pauseBgIcon = document.createElement("img")
	const nextBgIcon = document.createElement("img")
	const pauseAudioIcon = document.createElement("img")

	container.classList.add("webm-bottom-buttons-container")

	pauseBg.id = "pause-bg"
	nextBg.id = "next-bg"
	pauseAudio.id = "pause-audio"

	nextBgIcon.classList.add("next-bg-icon")
	pauseBgIcon.classList.add("pause-bg-icon")
	pauseAudioIcon.classList.add("pause-audio-icon")
	
	play_pause_set_icon_audio(pauseAudioIcon)
	pauseAudio.addEventListener("click", () => {
		force_audio_pause = !force_audio_pause
		audio_play_pause()
		play_pause_set_icon_audio()
	})

	play_pause_set_icon(pauseBgIcon)
	pauseBg.addEventListener("click", () => {
		force_bg_pause = !force_bg_pause
		hutao_play_pause()
		play_pause_set_icon()
	})

	nextBg.addEventListener("click", () => {
		next_wallpaper()
	})

	nextBgIcon.setAttribute("src", "//assets/HuTao/Icon/next_button.png")
	document.getElementsByClassName("rcp-fe-lol-home")[0].appendChild(container)
	container.append(pauseBg)
	container.append(pauseAudio)
	container.append(nextBg)
	pauseBg.append(pauseBgIcon)
	pauseAudio.append(pauseAudioIcon)
	nextBg.append(nextBgIcon)
}


function create_element(tagName, className, content) {
	const el = document.createElement(tagName);
	el.className = className;
	if (content) {
		el.innerHTML = content;
	}
	return el;
};


function go_to_default_home_page() {
	if (default_settings["default_home_page"]) {
		document.querySelector(`lol-uikit-navigation-item[item-id='${default_settings["default_home_page"]}']`).click()
	}
}

function add_hutao_home_page() {
	let lol_home = document.querySelector(".rcp-fe-lol-home > lol-uikit-section-controller")

	if (lol_home) {
		if (!lol_home.querySelector("[section-id='hutao-home']")) {
			let hutao_home = create_element("lol-uikit-section", "")
			let div = create_element("div", "wrapper")

			div.id = "hutao-home"
			hutao_home.setAttribute("section-id", "hutao-home")
			hutao_home.append(div)
			lol_home.prepend(hutao_home)
		}
	}
}

function add_hutao_home_navbar() {
	let navbar = document.querySelector(".rcp-fe-lol-home > lol-uikit-navigation-bar")

	if (navbar) {
		if (!navbar.querySelector("[item-id='hutao-home']")) {
			let hutao_home_navbar_item = create_element("lol-uikit-navigation-item", "")

			hutao_home_navbar_item.setAttribute("item-id", "hutao-home")
			hutao_home_navbar_item.setAttribute("priority", 1)
			hutao_home_navbar_item.textContent = "Hu Tao theme by Rumi"
			navbar.prepend(hutao_home_navbar_item)
		}
	}
}

let pageChangeMutation = (node) => {
	let pagename;
	let hutao_bg_elem = document.getElementById("hutao-bg")
	let brightness_modifiers = ["rcp-fe-lol-champ-select", "rcp-fe-lol-store", "rcp-fe-lol-collections", "rcp-fe-lol-profiles-main",
		"rcp-fe-lol-parties", "rcp-fe-lol-loot", "rcp-fe-lol-clash-full"]
	pagename = node.getAttribute("data-screen-name")

	console.log(pagename)
	if (pagename == "rcp-fe-lol-home-main") {
		if (!document.getElementsByClassName("webm-bottom-buttons-container").length) {
			create_webm_buttons()
		}
		add_hutao_home_page()
		add_hutao_home_navbar()
		go_to_default_home_page()
	}
	else if (pagename != "rcp-fe-lol-navigation-screen" && pagename != "window-controls" && pagename != "rcp-fe-lol-home" && pagename != "social") {
		if (document.getElementsByClassName("webm-bottom-buttons-container").length) {
			document.getElementsByClassName("webm-bottom-buttons-container")[0].remove()
		}
	}
	if (pagename == "social") {
		if (patcher_go_to_default_home_page){
			go_to_default_home_page()
			patcher_go_to_default_home_page = false
		}
	}
	if (pagename == "rcp-fe-lol-uikit-full-page-modal-controller") {
		return;
	}
	if (pagename == "rcp-fe-lol-champ-select") {
		hutao_bg_elem.style.filter = 'blur(3px) brightness(0.4) saturate(1.5)';
	}
	else if (previous_page == "rcp-fe-lol-champ-select" && brightness_modifiers.indexOf(pagename) == -1) {
		hutao_bg_elem.style.filter = 'brightness(0.7) saturate(0.8)';
	}
	if (pagename == "rcp-fe-lol-clash-full") {
		hutao_bg_elem.style.filter = 'blur(10px) brightness(0.2)';
	}
	else if (previous_page == "rcp-fe-lol-clash-full" && brightness_modifiers.indexOf(pagename) == -1) {
		hutao_bg_elem.style.filter = 'brightness(0.7) saturate(0.8)';
	}
	if (pagename == "rcp-fe-lol-loot") {
		hutao_bg_elem.style.filter = 'brightness(0.3)';
	}
	else if (previous_page == "rcp-fe-lol-loot" && brightness_modifiers.indexOf(pagename) == -1) {
		hutao_bg_elem.style.filter = 'brightness(0.7) saturate(0.8)';
	}
	if (pagename == "rcp-fe-lol-store") {
		hutao_bg_elem.style.filter = 'brightness(0.2)';
	}
	else if (previous_page == "rcp-fe-lol-store" && brightness_modifiers.indexOf(pagename) == -1) {
		hutao_bg_elem.style.filter = 'brightness(0.7) saturate(0.8)';
	}
	if (pagename == "rcp-fe-lol-collections") {
		hutao_bg_elem.style.filter = 'brightness(0.2)';
	}
	else if (previous_page == "rcp-fe-lol-collections" && brightness_modifiers.indexOf(pagename) == -1) {
		hutao_bg_elem.style.filter = 'brightness(0.7) saturate(0.8)';
	}
	if (pagename == "rcp-fe-lol-profiles-main") {
		let rankedNode = document.querySelector('[section-id="profile_subsection_leagues"]')

		if (!ranked_observer && rankedNode) {
			ranked_observer = new MutationObserver(mutations => {
				mutations.forEach(mutation => {
					if (mutation.target.classList.contains('visible')) {
						let tmpInterval = window.setInterval(() => {
							try {
								document.querySelector("div.smoke-background-container > lol-uikit-parallax-background").shadowRoot.querySelector(".parallax-layer-container").style.backgroundImage = ''
								window.clearInterval(tmpInterval)
							}
							catch {
								;
							}
						}, 50)
					}
				});
			});
			ranked_observer.observe(document.querySelector('[section-id="profile_subsection_leagues"]'), { attributes: true, childList: false, subtree: false });
		}
		hutao_bg_elem.style.filter = bg_filters["rcp-fe-lol-profiles-main"][wallpapers[0]];
	}
	else if (previous_page == "rcp-fe-lol-profiles-main") {
		if (brightness_modifiers.indexOf(pagename) == -1)
			hutao_bg_elem.style.filter = 'brightness(0.7) saturate(0.8)';
		if (ranked_observer)
			ranked_observer.disconnect()
		ranked_observer = undefined
	}
	if (pagename == "rcp-fe-lol-parties") {
		hutao_bg_elem.style.filter = bg_filters["rcp-fe-lol-parties"][wallpapers[0]];
	}
	else if (previous_page == "rcp-fe-lol-parties" && brightness_modifiers.indexOf(pagename) == -1) {
		hutao_bg_elem.style.filter = bg_filters["default"][wallpapers[0]];
	}
	if (previous_page != pagename)
		previous_page = pagename
}


window.addEventListener('load', () => {
	utils.mutationObserverAddCallback(pageChangeMutation, ["screen-root"])
})


window.addEventListener('DOMContentLoaded', () => {
	const video = document.createElement('video');
	video.id = 'hutao-bg';
	video.setAttribute('autoplay', '');
	video.setAttribute('loop', '');
	video.setAttribute('muted', '');
	video.src = default_settings["default_wallpaper_src"];
	utils.subscribe_endpoint("/lol-gameflow/v1/gameflow-phase", updateLobbyRegaliaBanner)
	utils.addCss(default_settings["css_file"])


    const source = default_settings["audio_src"];
    const audio = document.createElement("audio");
	audio.id = 'bg-audio';
	audio.autoplay = default_settings["default_sound_autoplay"];
	audio.loop = true;
	// audio.controls = true;
	audio.volume = default_settings["default_sound_volume"];
	audio.src = source;
	audio.load()
    audio.addEventListener("load", function() { 
        audio.play(); 
    }, true);


	document.querySelector("body").prepend(video)
	document.querySelector("body").prepend(audio)
	// document.querySelector("body").prepend(create_audio_element())
	hutao_play_pause()
	//removeIframe()
	utils.subscribe_endpoint('/lol-gameflow/v1/gameflow-phase', (message) => {
		let phase = JSON.parse(message["data"])[2]["data"]

		if (phase == "GameStart" || phase == "InProgress") {
			document.getElementById("hutao-bg").style.filter = 'blur(2px) brightness(0.4) saturate(1.5)';
			document.getElementById("hutao-bg").pause()
			document.getElementById("bg-audio").pause()
		}
		else {
			hutao_play_pause()
			audio_play_pause()
		}
	})
	console.clear();
})
