/* global Hammer */

import { action } from '@ember/object'
import { htmlSafe } from '@ember/string'
import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function parseArg(arg, defaultValue) {
  let num = Number(arg)
  return isNaN(num) ? defaultValue : num
}

export default class PaperDualSliderComponent extends Component {
  /*
    Args
      disabled
      min: min value, default 0
      max: max value, default 100
      step: step size, default 1
      start, end: cursor values
      minDistance: minimum distance between start and end, default 0
      startTooltip, endTooltip: visible cursor values
      onChange: (start, end)
      onSettled: called when releasing drag
      class: css classnames
      warn/accent/primary: paper styling
   */

  @tracked active = false
  @tracked dragging = false
  @tracked focused = false

  elem = null
  track = null
  manager = null
  movingThumb = null

  get min() {
    return parseArg(this.args.min, 0)
  }

  get max() {
    return parseArg(this.args.max, 100)
  }

  get minDistance() {
    return parseArg(this.args.minDistance, 0)
  }

  get step() {
    return parseArg(this.args.step, 1)
  }

  get start() {
    return parseArg(this.args.start, this.min)
  }

  get end() {
    let {
      start,
      max,
      args: { end }
    } = this

    return clamp(parseArg(end, max), start, max)
  }

  get startRatio() {
    let { start, min, max } = this
    return clamp((start - min) / (max - min), 0, 1)
  }

  get endRatio() {
    let { end, min, max } = this
    return clamp((end - min) / (max - min), 0, 1)
  }

  get activeTrackStyle() {
    let { startRatio, endRatio } = this
    let left = startRatio * 100
    let width = (endRatio - startRatio) * 100

    return htmlSafe(`margin-left: ${left}%; width: ${width}%`)
  }

  get startThumbContainerStyle() {
    let left = this.startRatio * 100
    return htmlSafe(`left: ${left}%`)
  }

  get endThumbContainerStyle() {
    let left = this.endRatio * 100
    return htmlSafe(`left: ${left}%`)
  }

  setValueFromEvent(eventX) {
    let {
      movingThumb,
      track,
      step,
      min,
      max,
      minDistance,
      start,
      end,
      args: { onChange }
    } = this

    let { left, width } = track.getBoundingClientRect()
    let ratio = clamp((eventX - left) / width, 0, 1)
    let exactValue = min + ratio * (max - min)
    let closestValue = clamp(Math.round(exactValue / step) * step, min, max)

    let newStart = start
    let newEnd = end

    if (!movingThumb) {
      if (closestValue < (start + end) / 2) {
        movingThumb = this.movingThumb = 'start'
      } else {
        movingThumb = this.movingThumb = 'end'
      }
    }

    if (movingThumb === 'start') {
      newStart = Math.min(closestValue, end - minDistance)
    } else {
      newEnd = Math.max(closestValue, start + minDistance)
    }

    if (onChange) {
      onChange(newStart, newEnd)
    }
  }

  @action
  onDidInsert(element) {
    this.elem = element
    if (!this.args.disabled) {
      this._setup()
    }
  }

  @action
  onDidInsertTrack(element) {
    this.track = element
  }

  @action
  onDidUpdate() {
    if (!this.args.disabled && !this.manager) {
      this._setup()
    } else if (this.args.disabled && this.manager) {
      this._teardown()
    }
  }

  @action
  onWillDestroy() {
    if (this.manager) {
      this._teardown()
    }
  }

  _setup() {
    let manager = new Hammer.Manager(this.elem)

    let pan = new Hammer.Pan({
      direction: Hammer.DIRECTION_HORIZONTAL,
      threshold: 10
    })
    let tap = new Hammer.Tap()

    manager.add(pan)
    manager.add(tap)

    manager
      .on('panstart', (...args) => this.onDragStart(...args))
      .on('panmove', (...args) => this.onDrag(...args))
      .on('panend', (...args) => this.onDragEnd(...args))
      .on('tap', (...args) => this.onTap(...args))

    this.manager = manager
  }

  _teardown() {
    this.manager.destroy()
    this.manager = null
  }

  onDragStart(event) {
    if (this.disabled) {
      return
    }

    this.active = true
    this.dragging = true
    this.elem.focus()

    this.setValueFromEvent(event.center.x)
  }

  onDrag(event) {
    if (this.disabled || !this.dragging) {
      return
    }

    this.setValueFromEvent(event.center.x)
  }

  onDragEnd() {
    if (this.disabled) {
      return
    }

    this.active = false
    this.dragging = false
    this.movingThumb = null

    if (this.args.onSettled) {
      this.args.onSettled()
    }
  }

  onTap(event) {
    if (this.disabled) {
      return
    }

    this.setValueFromEvent(event.center.x)
    this.movingThumb = null

    if (this.args.onSettled) {
      this.args.onSettled()
    }
  }

  @action
  onFocusIn() {
    if (!this.disabled) {
      this.set('focused', true)
    }
  }

  @action
  onFocusOut() {
    this.set('focused', false)
  }
}
