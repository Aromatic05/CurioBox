import React from "react";
import {
    Card,
    CardMedia,
    CardContent,
    Typography,
    Button,
    CircularProgress,
} from "@mui/material";

import { shake, moveToCenter } from "./boxOpenAnimationUtils";
import type { IUserBox } from "../api/orderApi";

export interface BoxOpenAnimationProps {
    userBox: IUserBox;
    step: "move" | "shake";
}

const BoxOpenAnimation: React.FC<BoxOpenAnimationProps> = ({
    userBox,
    step,
}) => {
    // 保证抖动动画期间始终居中和放大，shake动画只做左右抖动
    return (
        <Card
            sx={{
                boxShadow: 6,
                borderRadius: 4,
                bgcolor: "background.paper",
                position: "fixed",
                left: "50%",
                top: "50%",
                width: 400,
                maxWidth: "90vw",
                minWidth: 260,
                zIndex: 1301,
                transform: "translate(-50%, -50%) scale(1.12)",
                animation:
                    step === "move"
                        ? `${moveToCenter} 1.8s cubic-bezier(.42,0,.58,1)`
                        : step === "shake"
                          ? `${shake} 0.7s linear`
                          : undefined,
                boxShadowColor: "secondary.main",
            }}
        >
            <CardMedia
                component="img"
                height="160"
                image={
                    userBox.curioBox.coverImage ||
                    "https://via.placeholder.com/300x160"
                }
                alt={userBox.curioBox.name}
                sx={{ objectFit: "cover", borderRadius: "8px 8px 0 0" }}
            />
            <CardContent>
                <Typography
                    gutterBottom
                    variant="h6"
                    align="center"
                    color="secondary.main"
                >
                    {userBox.curioBox.name}
                </Typography>
                <Button
                    fullWidth
                    variant="contained"
                    color="secondary"
                    size="large"
                    disabled
                    sx={{
                        fontSize: 18,
                        py: 1.5,
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                    }}
                >
                    <CircularProgress size={28} color="secondary" />
                </Button>
            </CardContent>
        </Card>
    );
};

export default BoxOpenAnimation;
