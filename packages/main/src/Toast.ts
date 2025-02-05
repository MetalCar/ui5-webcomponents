import Integer from "@ui5/webcomponents-base/dist/types/Integer.js";
import UI5Element from "@ui5/webcomponents-base/dist/UI5Element.js";
import litRender from "@ui5/webcomponents-base/dist/renderer/LitRenderer.js";
import { getNextZIndex } from "@ui5/webcomponents-base/dist/util/PopupUtils.js";
import customElement from "@ui5/webcomponents-base/dist/decorators/customElement.js";
import property from "@ui5/webcomponents-base/dist/decorators/property.js";
import ToastPlacement from "./types/ToastPlacement.js";

// Template
import ToastTemplate from "./generated/templates/ToastTemplate.lit.js";

// Styles
import ToastCss from "./generated/themes/Toast.css.js";

// Constants
const MIN_DURATION = 500;
const MAX_DURATION = 1000;

/**
 * @class
 *
 * <h3 class="comment-api-title">Overview</h3>
 *
 * The <code>ui5-toast</code> is a small, non-disruptive popup for success or information messages that
 * disappears automatically after a few seconds.
 *
 *
 * <h3>Usage</h3>
 *
 * <h4>When to use:</h4>
 * <ul>
 * <li>You want to display a short success or information message.</li>
 * <li>You do not want to interrupt users while they are performing an action.</li>
 * <li>You want to confirm a successful action.</li>
 * </ul>
 * <h4>When not to use:</h4>
 * <ul>
 * <li>You want to display error or warning message.</li>
 * <li>You want to interrupt users while they are performing an action.</li>
 * <li>You want to make sure that users read the message before they leave the page.</li>
 * <li>You want users to be able to copy some part of the message text.</li>
 * </ul>
 *
 * <h3>ES6 Module Import</h3>
 *
 * <code>import "@ui5/webcomponents/dist/Toast";</code>
 *
 * @constructor
 * @author SAP SE
 * @alias sap.ui.webc.main.Toast
 * @extends sap.ui.webc.base.UI5Element
 * @tagname ui5-toast
 * @public
 * @since 1.0.0-rc.6
 */
@customElement({
	tag: "ui5-toast",
	renderer: litRender,
	styles: ToastCss,
	template: ToastTemplate,
})
class Toast extends UI5Element {
	/**
	 * Defines the duration in milliseconds for which component
	 * remains on the screen before it's automatically closed.
	 * <br><br>
	 * <b>Note:</b> The minimum supported value is <code>500</code> ms
	 * and even if a lower value is set, the duration would remain <code>500</code> ms.
	 *
	 * @type {sap.ui.webc.base.types.Integer}
	 * @name sap.ui.webc.main.Toast.prototype.duration
	 * @defaultvalue 3000
	 * @public
	 */
	@property({ validator: Integer, defaultValue: 3000 })
	duration!: number;

	/**
	 * Defines the placement of the component.
	 * <br><br>
	 * Available options are:
	 * <ul>
	 * <li><code>TopStart</code></li>
	 * <li><code>TopCenter</code></li>
	 * <li><code>TopEnd</code></li>
	 * <li><code>MiddleStart</code></li>
	 * <li><code>MiddleCenter</code></li>
	 * <li><code>MiddleEnd</code></li>
	 * <li><code>BottomStart</code></li>
	 * <li><code>BottomCenter</code></li>
	 * <li><code>BottomEnd</code></li>
	 * </ul>
	 *
	 * @type {sap.ui.webc.main.types.ToastPlacement}
	 * @name sap.ui.webc.main.Toast.prototype.placement
	 * @defaultvalue "BottomCenter"
	 * @public
	 */
	@property({ type: ToastPlacement, defaultValue: ToastPlacement.BottomCenter })
	placement!: `${ToastPlacement}`;

	/**
	 * Indicates whether the component is open (visible).
	 * @type {boolean}
	 * @private
	 */
	@property({ type: Boolean })
	open!: boolean;

	/**
	 * Indicates whether the component is hovered.
	 * @type {boolean}
	 * @private
	 */
	@property({ type: Boolean })
	hover!: boolean;

	/**
	 * Indicates whether the component DOM is rendered.
	 * @type {boolean}
	 * @private
	 */
	@property({ type: Boolean })
	domRendered!: boolean;

	/**
	 * Defines the text of the component.
	 * <br><br>
	 * <b>Note:</b> Although this slot accepts HTML Elements, it is strongly recommended that you only use text in order to preserve the intended design.
	 *
	 * @type {Node[]}
	 * @slot
	 * @public
	 * @name sap.ui.webc.main.Toast.prototype.default
	 */

	_reopen: boolean;

	constructor() {
		super();

		this._reopen = false;
	}

	onAfterRendering() {
		if (this._reopen) {
			this._reopen = false;
			this._initiateOpening();
		}
	}

	/**
	 * Shows the component.
	 * @public
	 */
	show() {
		if (this.open) {
			// If the Toast is already opened, we set the _reopen flag to true, in
			// order to trigger re-rendering after an animation frame
			// in the onAfterRendering hook.
			// This is needed for properly resetting the opacity transition.
			this._reopen = true;
			this.open = false;
		} else {
			this._initiateOpening();
		}
	}

	/**
	 * If the minimum duration is lower than 500ms, we force
	 * it to be 500ms, as described in the documentation.
	 * @private
	 * @returns {*}
	 */
	get effectiveDuration() {
		return this.duration < MIN_DURATION ? MIN_DURATION : this.duration;
	}

	get styles() {
		// Transition duration (animation) should be a third of the duration
		// property, but not bigger than the maximum allowed (1000ms).
		const transitionDuration = Math.min(this.effectiveDuration / 3, MAX_DURATION);

		return {
			root: {
				"transition-duration": this.open ? `${transitionDuration}ms` : "",

				// Transition delay is the duration property minus the
				// transition duration (animation).
				"transition-delay": this.open ? `${this.effectiveDuration - transitionDuration}ms` : "",

				// We alter the opacity property, in order to trigger transition
				"opacity": this.open && !this.hover ? "0" : "",

				"z-index": getNextZIndex(),
			},
		};
	}

	_initiateOpening() {
		this.domRendered = true;
		requestAnimationFrame(() => {
			this.open = true;
		});
	}

	_ontransitionend() {
		if (this.hover) {
			return;
		}
		this.domRendered = false;
		this.open = false;
	}

	_onmouseover() {
		this.hover = true;
	}

	_onmouseleave() {
		this.hover = false;
	}
}

Toast.define();

export default Toast;
