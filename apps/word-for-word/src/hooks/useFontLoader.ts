import { useFonts } from "expo-font";
import {
  useFonts as useMerriweather,
  Merriweather_400Regular as MerriweatherRegular,
} from '@expo-google-fonts/merriweather';
import {
  useFonts as useLora,
  Lora_400Regular as LoraRegular,
} from '@expo-google-fonts/lora';
import {
  useFonts as useSourceSerifPro,
  SourceSerifPro_400Regular as SourceSerifProRegular,
} from '@expo-google-fonts/source-serif-pro';
import {
  useFonts as useSourceSansPro,
  SourceSansPro_400Regular as SourceSansProRegular,
} from '@expo-google-fonts/source-sans-pro';
import {
  useFonts as useOpenSans,
  OpenSans_400Regular as OpenSansRegular,
} from '@expo-google-fonts/open-sans';
import {
  useFonts as useInter,
  Inter_400Regular as InterRegular,
  Inter_600SemiBold as InterSemiBold,
  Inter_700Bold as InterBold,
} from '@expo-google-fonts/inter';

export function useFontLoader() {
  const [sahityaLoaded] = useFonts({
    'Sahitya-Regular': require('../../assets/fonts/Sahitya-Regular.ttf'),
  });

  const [merriweatherLoaded] = useMerriweather({
    'Merriweather-Regular': MerriweatherRegular,
  });

  const [loraLoaded] = useLora({
    'Lora-Regular': LoraRegular,
  });

  const [sourceSerifLoaded] = useSourceSerifPro({
    'SourceSerifPro-Regular': SourceSerifProRegular,
  });

  const [sourceSansLoaded] = useSourceSansPro({
    'SourceSansPro-Regular': SourceSansProRegular,
  });

  const [openSansLoaded] = useOpenSans({
    'OpenSans-Regular': OpenSansRegular,
  });

  const [interLoaded] = useInter({
    'Inter-Regular': InterRegular,
    'Inter-SemiBold': InterSemiBold,
    'Inter-Bold': InterBold,
  });

  return sahityaLoaded && merriweatherLoaded && loraLoaded &&
    sourceSerifLoaded && sourceSansLoaded && openSansLoaded && interLoaded;
}
