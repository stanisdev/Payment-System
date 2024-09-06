import { Module } from "@nestjs/common";
import { FeeProvider } from "./fee.provider";

@Module({
    providers: [FeeProvider],
    exports: [FeeProvider],
})
export class FeeModule {}
