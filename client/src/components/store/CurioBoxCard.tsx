import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
    Card,
    CardActionArea,
    CardContent,
    CardMedia,
    Typography,
    Box,
} from "@mui/material";
import type { ICurioBox } from "../../api/curioBoxApi"; // 从您的API文件导入类型

interface CurioBoxCardProps {
    box: ICurioBox;
}

const CurioBoxCard: React.FC<CurioBoxCardProps> = ({ box }) => {
    return (
        <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <CardActionArea component={RouterLink} to={`/box/${box.id}`}>  
                <Box sx={{ position: "relative" }}>
                    <CardMedia
                        component="img"
                        height="200"
                        image={box.coverImage || "哈哈哈"}
                        alt={box.name}
                    />
                    {box.boxCount === 0 && (
                        <Box
                            sx={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: "rgba(0,0,0,0.3)",
                                zIndex: 2,
                            }}
                        >
                            <img
                                src={process.env.PUBLIC_URL + "/maidiaole.png"}
                                alt="卖完了"
                                style={{
                                    maxWidth: "70%",
                                    maxHeight: "70%",
                                    opacity: 0.85,
                                }}
                            />
                        </Box>
                    )}
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                    <Typography
                        gutterBottom
                        variant="h6"
                        component="div"
                        noWrap
                    >
                        {box.name}
                    </Typography>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Typography variant="body2" color="text.secondary">
                            {box.category}
                        </Typography>
                        <Typography variant="h6" color="primary">
                            ¥{box.price.toFixed(2)}
                        </Typography>
                    </Box>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

export default CurioBoxCard;
