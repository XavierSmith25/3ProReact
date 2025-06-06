import React, { useEffect, useState } from 'react';
import { Box, Grid, TextField, Typography, Button, InputLabel, Input, TableContainer, Paper, TableHead, TableRow, Table, TableBody, Checkbox, TableCell, FormControlLabel, } from '@mui/material';
import { grey } from "@mui/material/colors";
import RegionUpdate from './RegionUpdate';
import caxios from '../../api/caxios';

function PlaceManagement() {
    const [ region, setRegion ] = useState({});

    const handleInputRegion = (e) => {
        const { name, value, files } = e.target;
        setRegion({ ...region, [name]: files ? files[0] : value });
      };
      

    const handleInsertRegion = async () => {
        try {
            console.log(region.files);
          const formData = new FormData();
          formData.append("regionName", region.regionName);
          formData.append("regionDetail", region.regionDetail);
          formData.append("file", region.files);  
      
          await caxios.post("/region", formData, {
            headers: {
              "Content-Type": "multipart/form-data"
            }
          });
      
          setRegion({
            regionName: '',
            regionDetail: '',
            files: null,
          });
      
          alert("지역이 등록되었습니다.");
        } catch (error) {
          const errorMessage = error?.response?.data || "등록 실패";
          alert(errorMessage);
          setRegion({
            regionName: '',
            regionDetail: '',
            files: null,
          });
        }
      };
      
      


    

    const [rows , setRows] = useState([]);
    useEffect (() => {
        caxios.get("/region")
        .catch((error) => {
            console.error("에러 발생:", error);
            alert("지역 목록을 불러오는데 실패했습니다.");
        })
        .then((resp) =>{
            setRows(resp.data);
        })

    }, [region])

    const [selected, setSelected] = useState([]);
      
    const handleSelect = (id) => {
        setSelected(prev =>
            prev.includes(id)
              ? prev.filter(item => item !== id)
              : [...prev, id]
          );
          console.log(selected);
    };
    const isSelected = (id) => selected.includes(id);
    
    const [ checked, setChecked ] = useState(false);
    const handleSelectAll = (e) => {
        const isChecked = e.target.checked;
        setChecked(isChecked);
        if (isChecked) {
          const allIds = rows.map((row) => row.regionId);
          setSelected(allIds);
        } else {
          setSelected([]);
        }
        
    }
    const handleDelete = () => {
        if(window.confirm("한번 삭제된 지역은 복구가 불가능합니다. 정말 삭제하시겠습니까?")){
            caxios.delete("/region/delete", {data:selected})
            .catch((error) => {
                console.error("에러 발생:", error);
                alert("지역 목록을 불러오는데 실패했습니다.");
            })
            .then(() => {alert("삭제가 완료되었습니다.")})
        }else{
            return;
        }
        
    }

    useEffect(() => {
        const allSelected = rows.length > 0 && selected.length === rows.length;
        setChecked(allSelected);
    }, [selected, rows]);
    
    const [open, setOpen] = useState(false);
    const [ editRegion, setEditRegion ] = useState();
    const handleUpdate = (row) => {
        setEditRegion(row); 
        setOpen(true);  
    }


    return (
        <Box sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
            지역 추가
        </Typography>

        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
            <TextField fullWidth label="지역명" name="regionName" value={region.regionName} variant="outlined" onChange={handleInputRegion}/>
            </Grid>

            <Grid item xs={12}>
            <TextField fullWidth label="지역 설명" name="regionDetail" value={region.regionDetail} multiline rows={4} variant="outlined"  onChange={handleInputRegion}/>
            </Grid>

            <Grid item xs={12}>
            <InputLabel htmlFor="region-image">지역 대표 이미지</InputLabel>
            <Input id="region-image" type="file" name="files" inputProps={{ accept: 'image/*' }} fullWidth  onChange={handleInputRegion}/>
            </Grid>

            <Grid item xs={12}>
            <Button variant="contained" color="primary" onClick={handleInsertRegion}> 지역 등록 </Button>
            </Grid>
        </Grid>
        <Typography variant="h5" gutterBottom>
            지역 목록
        </Typography>
        <FormControlLabel
            control={
                <Checkbox
                checked={checked}
                onChange={handleSelectAll}
                    sx={{
                        color: grey[600],
                        '&.Mui-checked': {
                        color: '#1976d2',
                        },
                    }}
                />
            }
            label="전체 선택"
            sx={{
                ml: 2,
                '.MuiFormControlLabel-label': {
                    fontSize: '1.1rem',
                    fontWeight: 500,
                    color: '#444',
                    }
            }}
        />
        <Button onClick={handleDelete}>삭제</Button>
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell padding="checkbox"/>
                        <TableCell>지역명</TableCell>
                        <TableCell>상세 설명</TableCell>
                        <TableCell>이미지</TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row) => (
                        <TableRow key={row.regionId} hover>
                        <TableCell padding="checkbox" sx={{width : "5%"}}>
                            <Checkbox
                            checked={isSelected(row.regionId)}
                            onChange={() => handleSelect(row.regionId)}
                            />
                        </TableCell>
                        <TableCell sx={{width : "10%"}}>{row.regionName}</TableCell>
                        <TableCell sx={{width : "50%"}}>{row.regionDetail}</TableCell>
                        <TableCell sx={{width : "25%"}}>
                            {
                                row.filePath && (
                                    <img src={row.filePath} alt="지역이미지" width="100"></img>
                                )
                            }
                        </TableCell>
                        <TableCell sx={{width : "10%"}}><Button onClick={() => handleUpdate(row)}>수정</Button></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
        {
           <RegionUpdate  open={open} onClose={() => setOpen(false)} editRegion={editRegion}/>
        }
        </Box>

        
    );
}

export default PlaceManagement;
