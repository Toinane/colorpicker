import {
  FunctionComponent,
  JSX,
  useCallback,
  useState,
  useEffect,
} from "react";
import Color from "colorjs.io";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { useTranslation } from "react-i18next";

import Icon, { IconEnum } from "@components/icons";
import { useColorStore } from "@stores/colorStore";
import { useSettingsStore } from "@stores/settingsStore";
import { useColorHistoryStore } from "@stores/colorHistoryStore";
import { showToast } from "@stores/toastStore";
import { isValidHex, serializeColor, toHex } from "@common/color";

import "./hexInput.css";

const HexInput: FunctionComponent = (): JSX.Element => {
  const CommonT = useTranslation("common");
  const { color, setColor, isDarkColor } = useColorStore((state) => state);
  const { defaultFormat, hexPrefix } = useSettingsStore();
  const [inputValue, setInputValue] = useState(toHex(color));

  useEffect(() => {
    setInputValue(toHex(color));
  }, [color]);

  const onInput = useCallback(
    (event: React.FormEvent<HTMLInputElement>) => {
      if (!(event.target instanceof HTMLInputElement)) return;
      const value = event.target.value;
      setInputValue(value);

      if (isValidHex(value)) {
        const newColor = new Color(value);
        setColor(newColor);
        useColorHistoryStore.getState().commitColor(toHex(newColor));
      }
    },
    [setColor],
  );

  const onKeyboard = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!(event.target instanceof HTMLInputElement)) return;

    if (event.code === "ArrowUp") {
      const newColor = new Color(event.target.value).to("srgb").set({
        r: (r) => (r < 1 ? r + 0.01 : r),
        g: (g) => (g < 1 ? g + 0.01 : g),
        b: (b) => (b < 1 ? b + 0.01 : b),
      });

      setColor(newColor);
      setInputValue(toHex(newColor));
      useColorHistoryStore.getState().commitColor(toHex(newColor));
    }
    if (event.code === "ArrowDown") {
      const newColor = new Color(event.target.value).to("srgb").set({
        r: (r) => (r > 0 ? r - 0.01 : r),
        g: (g) => (g > 0 ? g - 0.01 : g),
        b: (b) => (b > 0 ? b - 0.01 : b),
      });

      setColor(newColor);
      setInputValue(toHex(newColor));
      useColorHistoryStore.getState().commitColor(toHex(newColor));
    }
  };

  const onCopy = () => {
    const text = serializeColor(color, defaultFormat, { hexPrefix });
    writeText(text)
      .then(() => showToast(CommonT.t("action.colorCopiedToast")))
      .catch((err) => console.error("Failed to copy color:", err));
  };

  return (
    <div className="hexInputGroup">
      <input
        className="hexInput"
        type="text"
        maxLength={7}
        value={inputValue}
        onInput={onInput}
        onKeyDown={onKeyboard}
        onFocus={(e) => e.target.select()}
        placeholder={toHex(color)}
      />
      <button
        type="button"
        className="hexInputCopyButton"
        onClick={onCopy}
        title={CommonT.t("action.copy")}
        aria-label={CommonT.t("action.copy")}
      >
        <Icon
          type={IconEnum.COPY}
          colors={{ main: isDarkColor ? "#fff" : "#000" }}
        />
      </button>
    </div>
  );
};

export default HexInput;
